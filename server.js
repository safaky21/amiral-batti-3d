const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());




const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error("[Veritabanı] Bağlantı hatası:", err.message);
    else console.log("[Veritabanı] SQLite veritabanına başarıyla bağlandı.");
});

db.serialize(() => {

    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        score INTEGER DEFAULT 0,
        games_played INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0.0
    )`);


    db.run(`CREATE TABLE IF NOT EXISTS Game_Logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        room_id TEXT,
        action_type TEXT,
        shoot_payload TEXT,
        user_agent TEXT
    )`);
});





app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Bilinmiyor";
    const userAgent = req.headers['user-agent'] || "Bilinmiyor";

    if (!username || !password) {
        return res.status(400).json({ error: "Kullanıcı adı ve şifre zorunlu." });
    }

    db.get(`SELECT * FROM Users WHERE username = ?`, [username], (err, row) => {
        if (err) return res.status(500).json({ error: "Veritabanı hatası" });

        let success = false;
        if (row) {

            if (row.password === password) {
                success = true;
                res.json({ id: row.id, username: row.username, score: row.score, win_rate: row.win_rate, games_played: row.games_played });
            } else {
                return res.status(401).json({ error: "Hatalı şifre!" });
            }
        } else {

            db.run(`INSERT INTO Users (username, password) VALUES (?, ?)`, [username, password], function (err) {
                if (err) return res.status(500).json({ error: "Kayıt hatası" });
                success = true;
                res.json({ id: this.lastID, username, score: 0, win_rate: 0, games_played: 0 });
            });
        }


        db.run(`INSERT INTO Game_Logs (ip_address, action_type, shoot_payload, user_agent) VALUES (?, ?, ?, ?)`,
            [clientIp, 'LOGIN_ATTEMPT', `user:${username},success:${success}`, userAgent]);
    });
});


app.get('/api/leaderboard', (req, res) => {
    db.all(`SELECT username, score, win_rate, games_played FROM Users ORDER BY score DESC LIMIT 5`, (err, rows) => {
        if (err) return res.status(500).json({ error: "Veritabanı hatası" });
        res.json(rows);
    });
});




const rooms = {};

io.on('connection', (socket) => {
    console.log(`[Yeni Bağlantı] Port açıldı: ${socket.id}`);

    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || "Bilinmiyor";
    const userAgent = socket.handshake.headers['user-agent'] || "Bilinmiyor";

    socket.on('create_room', (data) => {
        const { roomId, username } = data;
        if (!rooms[roomId]) {
            rooms[roomId] = { players: {}, turn: null, phase: 'LOBBY' };
            rooms[roomId].players[socket.id] = { role: 'host', ready: false, username };
            socket.join(roomId);

            socket.emit('room_created', { success: true, roomId });
            console.log(`[Oda] ${roomId} kuruldu (Host: ${username})`);

            db.run(`INSERT INTO Game_Logs (ip_address, action_type, room_id, user_agent) VALUES (?, ?, ?, ?)`,
                [clientIp, 'CREATE_ROOM', roomId, userAgent]);
        } else {
            socket.emit('room_error', "Bu oda kodu zaten meşgul.");
        }
    });

    socket.on('join_room', (data) => {
        const { roomId, username } = data;
        if (rooms[roomId] && rooms[roomId].phase === 'LOBBY') {
            const currentPlayers = Object.keys(rooms[roomId].players).length;
            if (currentPlayers < 2) {
                rooms[roomId].players[socket.id] = { role: 'guest', ready: false, username };
                socket.join(roomId);

                socket.emit('room_joined', { success: true, roomId });
                console.log(`[Oda] ${roomId} katılındı (Guest: ${username})`);

                rooms[roomId].phase = 'PLACEMENT';
                io.to(roomId).emit('planning_phase', "Oyuncular bağlandı. Lütfen gemilerinizi tahtaya yerleştiriniz.");

                db.run(`INSERT INTO Game_Logs (ip_address, action_type, room_id, user_agent) VALUES (?, ?, ?, ?)`,
                    [clientIp, 'JOIN_ROOM', roomId, userAgent]);
            } else {
                socket.emit('room_error', "Oda tam kapasiteye ulaştı.");
            }
        } else {
            socket.emit('room_error', "Oda bulunamadı veya oyun çoktan başladı.");
        }
    });

    socket.on('player_ready', (data) => {
        const roomId = data.roomId;
        if (rooms[roomId] && rooms[roomId].players[socket.id]) {
            rooms[roomId].players[socket.id].ready = true;

            const playersArray = Object.keys(rooms[roomId].players);
            const allReady = playersArray.every(pId => rooms[roomId].players[pId].ready);

            if (allReady && playersArray.length === 2 && rooms[roomId].phase !== 'BATTLE') {
                rooms[roomId].phase = 'BATTLE';
                rooms[roomId].turn = playersArray[0];
                io.to(roomId).emit('game_start', "İki filo da hazır. Savaş başladı!");
                io.to(roomId).emit('turn_update', rooms[roomId].turn);
            } else {
                socket.emit('waiting_opponent', "Karşı tarafın gemilerini dizmesi bekleniyor...");
            }
        }
    });

    socket.on('shoot', (payload) => {
        const { roomId, x, y } = payload;

        if (rooms[roomId] && rooms[roomId].phase === 'BATTLE') {
            if (rooms[roomId].turn !== socket.id) {
                return socket.emit('validation_error', "Henüz sizin sıranız gelmedi!");
            }

            const payloadStr = JSON.stringify({ x, y });
            db.run(
                `INSERT INTO Game_Logs (ip_address, action_type, room_id, shoot_payload, user_agent) VALUES (?, ?, ?, ?, ?)`,
                [clientIp, 'SHOOT_PAYLOAD', roomId, payloadStr, userAgent]
            );

            socket.to(roomId).emit('receive_shot', { shooter: socket.id, x, y });
        }
    });

    socket.on('shot_result', (data) => {
        const logEntry = {
            ip: clientIp,
            room_id: data.roomId,
            action: 'SHOT_RESULT',
            payload: `x:${data.x},y:${data.y},hit:${data.isHit},sunk:${data.sunkShipName || 'none'},gameOver:${data.fleetDestroyed || false}`,
            user_agent: userAgent
        };

        db.run(`INSERT INTO Game_Logs (ip_address, room_id, action_type, shoot_payload, user_agent) VALUES (?, ?, ?, ?, ?)`,
            [logEntry.ip, logEntry.room_id, logEntry.action, logEntry.payload, logEntry.user_agent]);

        io.to(data.shooter).emit('shot_feedback', data);

        if (data.fleetDestroyed) {
            io.to(data.roomId).emit('game_over', {
                winner: data.shooter,
                loser: socket.id
            });




            const room = rooms[data.roomId];
            if (room) {
                const winnerUsername = room.players[data.shooter]?.username;
                const loserUsername = room.players[socket.id]?.username;

                if (winnerUsername) {

                    db.run(`UPDATE Users SET score = score + 10, games_played = games_played + 1 WHERE username = ?`, [winnerUsername], function () {
                        db.run(`UPDATE Users SET win_rate = ROUND(CAST((score/10) AS REAL) / games_played * 100, 2) WHERE username = ?`, [winnerUsername]);
                    });
                }
                if (loserUsername) {

                    db.run(`UPDATE Users SET games_played = games_played + 1 WHERE username = ?`, [loserUsername], function () {
                        db.run(`UPDATE Users SET win_rate = ROUND(CAST((score/10) AS REAL) / games_played * 100, 2) WHERE username = ?`, [loserUsername]);
                    });
                }
                delete rooms[data.roomId];
            }
        } else {
            if (rooms[data.roomId]) {
                const playersArray = Object.keys(rooms[data.roomId].players);
                const currentIndex = playersArray.indexOf(rooms[data.roomId].turn);
                const nextIndex = (currentIndex + 1) % 2;
                rooms[data.roomId].turn = playersArray[nextIndex];

                io.to(data.roomId).emit('turn_update', rooms[data.roomId].turn);
            }
        }
    });

    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            if (rooms[roomId].players[socket.id]) {
                delete rooms[roomId].players[socket.id];
                io.to(roomId).emit('opponent_disconnected', "Düşman filosu radardan kayboldu (Bağlantı koptu).");
                delete rooms[roomId];
                break;
            }
        }
    });
});




process.on('uncaughtException', (err) => {
    console.error('Kritik Hata (Uncaught Exception):', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Beklenmeyen Hata (Unhandled Rejection):', reason);
});

let PORT = process.env.PORT || 3000;

function startServer(port) {
    server.listen(port, () => {
        console.log(`🚀 Savaş Sunucusu (Backend) http://localhost:${port} portunda başarıyla çalışıyor.`);
        const { exec } = require('child_process');
        exec(`start http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`[Uyarı] Port ${port} dolu. Port ${port + 1} deneniyor...`);
            startServer(port + 1);
        } else {
            console.error('Sunucu Başlatma Hatası:', err);
        }
    });
}

startServer(PORT);
