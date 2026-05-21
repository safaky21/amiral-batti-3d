import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';




let GAME_PHASE = 'LOGIN'; 
let myRoomId = null;
let currentTurn = false;
let isAnimating = false;
let currentUser = null; 

const myShotHistory = new Set();
const enemyShotHistory = new Set();


let isBotMode = false;
let botFleet = [];
const botShotHistory = new Set();
let botHits = []; 


let turnTimerInterval = null;
let turnTimeLeft = 30;

function startTurnTimer() {
    stopTurnTimer(); 
    turnTimeLeft = 30;
    updateTurnTimerUI();

    turnTimerInterval = setInterval(() => {
        turnTimeLeft--;
        updateTurnTimerUI();

        if (turnTimeLeft <= 0) {
            stopTurnTimer();
            autoRandomShot(); 
        }
    }, 1000);
}

function stopTurnTimer() {
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
        turnTimerInterval = null;
    }
    
    const timerSpan = document.getElementById('turn-timer-span');
    if (timerSpan) timerSpan.remove();
}

function updateTurnTimerUI() {
    let timerSpan = document.getElementById('turn-timer-span');
    if (!timerSpan) {
        timerSpan = document.createElement('span');
        timerSpan.id = 'turn-timer-span';
        timerSpan.style.marginLeft = '10px';
        timerSpan.style.fontWeight = 'bold';
        turnInfo.appendChild(timerSpan); 
    }
    timerSpan.innerText = `(${turnTimeLeft}s)`;
    
    
    timerSpan.style.color = turnTimeLeft <= 5 ? '#ff3b30' : '#66fcf1';
}

function autoRandomShot() {
    
    if (!currentTurn || isAnimating || GAME_PHASE !== 'BATTLE') return;
    
    let targetX, targetY;
    let validShot = false;
    
    
    while (!validShot) {
        targetX = Math.floor(Math.random() * 10);
        targetY = Math.floor(Math.random() * 10);
        if (!myShotHistory.has(`${targetX},${targetY}`)) {
            validShot = true;
        }
    }

    
    myShotHistory.add(`${targetX},${targetY}`);
    currentTurn = false;
    isAnimating = true;

    if (isBotMode) {
        processBotModeShot(targetX, targetY);
    } else {
        socket.emit('shoot', { roomId: myRoomId, x: targetX, y: targetY });
    }
}



const loginPanel = document.getElementById('login-panel');
const lobbyContainer = document.getElementById('lobby-container');
const planningPanel = document.getElementById('planning-panel');
const gameInfoPanel = document.getElementById('game-info');
const placementStatus = document.getElementById('placement-status');
const btnReady = document.getElementById('btn-ready');
const logList = document.getElementById('log-list');
const turnInfo = document.getElementById('turn-info');
const userDisplay = document.getElementById('user-display');
const lbList = document.getElementById('lb-list');


let isMusicEnabled = true;
let isSfxEnabled = true;
const btnSettings = document.getElementById('btn-settings');
const settingsModal = document.getElementById('settings-modal');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnToggleMusic = document.getElementById('btn-toggle-music');
const btnToggleSfx = document.getElementById('btn-toggle-sfx');
let userInteracted = false;

const socket = io();


const radarBorder = document.createElement('div');
radarBorder.id = 'radar-border';
radarBorder.style.position = 'absolute';
radarBorder.style.right = '20px';
radarBorder.style.bottom = '20px';
radarBorder.style.width = '250px';
radarBorder.style.height = '250px';
radarBorder.style.border = '2px solid #66fcf1';
radarBorder.style.backgroundColor = 'rgba(0, 5, 16, 0.4)';
radarBorder.style.boxShadow = '0 0 10px rgba(102, 252, 241, 0.5)';
radarBorder.style.pointerEvents = 'none';
radarBorder.style.display = 'none';
radarBorder.style.zIndex = '5';
document.body.appendChild(radarBorder);

const radarTitle = document.createElement('div');
radarTitle.innerText = "SAVUNMA RADARI";
radarTitle.style.position = 'absolute';
radarTitle.style.top = '-20px';
radarTitle.style.left = '0';
radarTitle.style.color = '#66fcf1';
radarTitle.style.fontSize = '12px';
radarTitle.style.fontWeight = 'bold';
radarTitle.style.textShadow = '0 0 5px #66fcf1';
radarBorder.appendChild(radarTitle);


let isRadarEnlarged = false;
const radarToggleBtn = document.createElement('button');
radarToggleBtn.id = 'radar-toggle';
radarToggleBtn.className = 'cyber-button';
radarToggleBtn.innerText = '🔍 RADARI BÜYÜT';
radarToggleBtn.style.position = 'absolute';
radarToggleBtn.style.right = '20px';
radarToggleBtn.style.bottom = '280px'; 
radarToggleBtn.style.padding = '5px 10px';
radarToggleBtn.style.fontSize = '10px';
radarToggleBtn.style.display = 'none';
radarToggleBtn.style.zIndex = '10';
radarToggleBtn.style.width = 'auto';
document.body.appendChild(radarToggleBtn);

radarToggleBtn.addEventListener('click', () => {
    isRadarEnlarged = !isRadarEnlarged;
    if (isRadarEnlarged) {
        radarToggleBtn.innerText = '➖ RADARI KÜÇÜLT';
        radarBorder.style.width = '500px';
        radarBorder.style.height = '500px';
        radarToggleBtn.style.bottom = '530px';
    } else {
        radarToggleBtn.innerText = '🔍 RADARI BÜYÜT';
        radarBorder.style.width = '250px';
        radarBorder.style.height = '250px';
        radarToggleBtn.style.bottom = '280px';
    }
});




const flashMessage = document.createElement('div');
flashMessage.style.position = 'absolute';
flashMessage.style.top = '50%';
flashMessage.style.left = '50%';
flashMessage.style.transform = 'translate(-50%, -50%)';
flashMessage.style.padding = '20px 40px';
flashMessage.style.fontSize = '40px';
flashMessage.style.fontWeight = 'bold';
flashMessage.style.color = 'white';
flashMessage.style.backgroundColor = 'rgba(10, 10, 20, 0.9)';
flashMessage.style.border = '4px solid';
flashMessage.style.borderRadius = '15px';
flashMessage.style.zIndex = '100';
flashMessage.style.pointerEvents = 'none';
flashMessage.style.display = 'none';
flashMessage.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
flashMessage.style.textAlign = 'center';
flashMessage.style.whiteSpace = 'pre-wrap';
document.body.appendChild(flashMessage);

let flashTimeout;
function showFlash(text, colorHex, stayForever = false) {
    clearTimeout(flashTimeout);
    flashMessage.innerText = text;
    flashMessage.style.borderColor = colorHex;
    flashMessage.style.textShadow = `0 0 20px ${colorHex}`;
    flashMessage.style.boxShadow = `0 0 40px ${colorHex}`;
    flashMessage.style.display = 'block';

    flashMessage.style.transform = 'translate(-50%, -50%) scale(1.1)';
    flashMessage.style.opacity = '1';

    setTimeout(() => {
        flashMessage.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);

    if (!stayForever) {
        flashTimeout = setTimeout(() => {
            flashMessage.style.opacity = '0';
            setTimeout(() => {
                if (flashMessage.style.opacity === '0') {
                    flashMessage.style.display = 'none';
                }
            }, 300);
        }, 1500);
    }
}







document.getElementById('btn-login').addEventListener('click', async () => {
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    const statusMsg = document.getElementById('login-status');

    if (!user || !pass) {
        statusMsg.innerText = "Kimlik No ve Şifre Boş Bırakılamaz!";
        statusMsg.style.color = "#ff3b30";
        return;
    }

    statusMsg.innerText = "Sisteme Ağlanıyor...";
    statusMsg.style.color = "#66fcf1";

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await res.json();

        if (res.ok) {
            currentUser = data;
            GAME_PHASE = 'LOBBY';
            loginPanel.style.display = 'none';
            lobbyContainer.style.display = 'flex'; 
            userDisplay.innerText = `[${currentUser.username.toUpperCase()}] PUAN: ${currentUser.score} | KAZANMA: %${currentUser.win_rate}`;
            fetchLeaderboard();

            
            if (listener.context.state === 'suspended') {
                listener.context.resume();
            }
            if (!sndMenu.isPlaying) playSound(sndMenu);
        } else {
            statusMsg.innerText = data.error || "Giriş reddedildi.";
            statusMsg.style.color = "#ff3b30";
        }
    } catch (err) {
        statusMsg.innerText = "Sunucu Bağlantısı Kurulamadı.";
        statusMsg.style.color = "#ff3b30";
    }
});


function fetchLeaderboard() {
    fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => {
            lbList.innerHTML = '';
            if (data.length === 0) {
                lbList.innerHTML = '<li style="color:#c5c6c7;">Sistemde kayıtlı veri yok.</li>';
                return;
            }
            data.forEach((p, i) => {
                const li = document.createElement('li');
                li.className = 'lb-item';
                li.innerHTML = `<span>${i + 1}. ${p.username}</span> <span>${p.score} PT</span>`;
                lbList.appendChild(li);
            });
        })
        .catch(err => console.error("Liderlik Tablosu Hatası:", err));
}



document.getElementById('btn-create').addEventListener('click', () => {
    const rId = document.getElementById('room-input').value.trim();
    if (rId && currentUser) socket.emit('create_room', { roomId: rId, username: currentUser.username });
});

document.getElementById('btn-join').addEventListener('click', () => {
    const rId = document.getElementById('room-input').value.trim();
    if (rId && currentUser) socket.emit('join_room', { roomId: rId, username: currentUser.username });
});

document.getElementById('btn-bot').addEventListener('click', () => {
    isBotMode = true;
    GAME_PHASE = 'PLACEMENT';
    lobbyContainer.style.display = 'none'; 
    planningPanel.style.display = 'block'; 
    revealShipsInDock();
    addLog("BOT MODU AKTİF: Lütfen tüm gemilerinizi oyun tahtasına dizin.");
    showFlash("YAPAY ZEKA\nMODU AKTİF", "#66fcf1");
});

btnReady.addEventListener('click', () => {
    GAME_PHASE = 'READY';
    btnReady.disabled = true;
    btnReady.innerText = "BEKLENİYOR...";

    if (isBotMode) {
        placementStatus.innerText = "Savaş pozisyonu alındı. Bot yerleşimi bekleniyor...";
        placementStatus.style.color = "#45a29e";
        generateBotFleet();
        setTimeout(() => {
            GAME_PHASE = 'BATTLE';
            planningPanel.style.display = 'none';
            if (sndMenu.isPlaying) sndMenu.stop();
            gameInfoPanel.style.display = 'block';
            radarBorder.style.display = 'block';
            radarToggleBtn.style.display = 'block'; 
            selectedShip = null;
            addLog("SAVAŞ BAŞLADI! Bot hedefleri kilitledi.");
            showFlash("Savaş başladı. Hedefleri belirleyin.", "#66fcf1");
            enemySubSunk = false;
            friendlySubSunk = false;
            playAnnouncerVoice('game_start.wav');
            currentTurn = true;
            turnInfo.style.color = "#66fcf1";
            turnInfo.innerText = ">> SIRA SİZDE! Kırmızı Bölgede Hedef Seçin. <<";
            startTurnTimer();
        }, 1500);
    } else {
        btnReady.innerText = "BEKLENİYOR... DÜŞMAN BEKLENİYOR";
        placementStatus.innerText = "Savaş pozisyonu alındı. Radarlar kilitlendi.";
        placementStatus.style.color = "#45a29e";
        socket.emit('player_ready', { roomId: myRoomId });
    }
});

socket.on('room_created', (data) => {
    myRoomId = data.roomId;
    addLog(`[${myRoomId}] Savaş Radarı kuruldu.`);
    document.getElementById('room-status').innerText = "Oda Başlatıldı. Düşman Bekleniyor...";
});

socket.on('room_joined', (data) => {
    myRoomId = data.roomId;
    addLog(`[${myRoomId}] Ağına girildi!`);
});

socket.on('planning_phase', (msg) => {
    GAME_PHASE = 'PLACEMENT';
    lobbyContainer.style.display = 'none'; 
    planningPanel.style.display = 'block'; 
    revealShipsInDock();
    addLog("PLANLAMA EVRESİ: Lütfen tüm gemilerinizi oyun tahtasına dizin.");
});

socket.on('game_start', (msg) => {
    GAME_PHASE = 'BATTLE';
    planningPanel.style.display = 'none';
    if (sndMenu.isPlaying) sndMenu.stop(); 
    gameInfoPanel.style.display = 'block';
    radarBorder.style.display = 'block';
    radarToggleBtn.style.display = 'block'; 
    selectedShip = null;
    addLog("SAVAŞ BAŞLADI! Tüm filolar yerlerine kilitlendi.");
    showFlash("Savaş başladı. Hedefleri belirleyin.", "#66fcf1");
    enemySubSunk = false;
    friendlySubSunk = false;
    playAnnouncerVoice('game_start.wav');
});

socket.on('waiting_opponent', (msg) => {
    if (GAME_PHASE === 'READY') {
        placementStatus.innerText = "Düşman filosunun dizilimi bekleniyor...";
    }
});

socket.on('turn_update', (turnSocketId) => {
    currentTurn = (turnSocketId === socket.id);
    if (currentTurn) {
        turnInfo.style.color = "#66fcf1";
        turnInfo.innerText = ">> SIRA SİZDE! Kırmızı Bölgede Hedef Seçin. <<";
        startTurnTimer();
    } else {
        turnInfo.style.color = "#ff3b30";
        turnInfo.innerText = "Düşman Atışa Hazırlanıyor...";
        stopTurnTimer();
    }
});

socket.on('receive_shot', (data) => {
    const { x, y } = data;
    enemyShotHistory.add(`${x},${y}`);

    let isHit = false;
    let sunkShipName = null;
    let sunkShipInfo = null;

    for (const ship of fleet) {
        if (ship.occupies(x, y)) {
            isHit = true;
            const isSunk = ship.takeDamage();
            if (isSunk) {
                sunkShipName = ship.type;
                sunkShipInfo = { x: ship.gridPos.x, y: ship.gridPos.y, direction: ship.direction };
            }
            break;
        }
    }

    let isFleetDestroyed = fleet.every(s => s.hitCount >= s.length);

    socket.emit('shot_result', {
        roomId: myRoomId,
        x, y,
        isHit: isHit,
        shooter: data.shooter,
        sunkShipName: sunkShipName,
        sunkShipInfo: sunkShipInfo,
        fleetDestroyed: isFleetDestroyed
    });

    playSound(sndIslik);

    createRocketEffect(x, y, enemyShotsGroup, () => {
        if (isHit) {
            createPeg(x, y, true, enemyShotsGroup);
            createExplosionEffect(x, y, enemyShotsGroup);
            playSound(sndExplosion);
            addLog(`>> DÜŞMAN (${x}, ${y}) VURDU! Gemimiz İsabet Aldı!`);

            if (sunkShipName) {
                const info = getShipDestroyedMessage(false, sunkShipName);
                showFlash(info.msg, "#ff3b30");
                playAnnouncerVoice(info.event);
            } else {
                showFlash("GEMİMİZ VURULDU! 💥", "#ff3b30");
            }
        } else {
            createPeg(x, y, false, enemyShotsGroup);
            createSplashEffect(x, y, enemyShotsGroup);
            playSound(sndSplash);
            addLog(`>> Düşman (${x}, ${y}) ıskaladı.`);
            showFlash("Düşman Iskaladı", "#a0d8ef");
        }
    });
});

socket.on('shot_feedback', (data) => {
    playSound(sndIslik);

    createRocketEffect(data.x, data.y, myShotsGroup, () => {
        isAnimating = false;

        if (data.isHit) {
            createPeg(data.x, data.y, true, myShotsGroup);
            createExplosionEffect(data.x, data.y, myShotsGroup);
            playSound(sndExplosion);
            addLog(`>> İSABET! (${data.x}, ${data.y}) Hedef Vuruldu!`);

            if (data.sunkShipName) {
                const info = getShipDestroyedMessage(true, data.sunkShipName);
                showFlash(info.msg, "#66fcf1");
                playAnnouncerVoice(info.event);
                if (data.sunkShipInfo) {
                    revealAndSinkEnemyShip(data.sunkShipName, data.sunkShipInfo);
                }
            } else {
                showFlash("İSABET! 🔥", "#ff3b30");
            }
        } else {
            createPeg(data.x, data.y, false, myShotsGroup);
            createSplashEffect(data.x, data.y, myShotsGroup);
            playSound(sndSplash);
            addLog(`>> Iska. (${data.x}, ${data.y}) Suya düştü.`);
            showFlash("ISKA", "#cccccc");
        }
    });
});

socket.on('game_over', (data) => {
    GAME_PHASE = 'GAMEOVER';
    currentTurn = false;
    stopTurnTimer();

    if (data.winner === socket.id) {
        setTimeout(() => {
            showFlash("Düşman donanması tamamen imha edildi. Görev başarılı.", "#66fcf1", true);
            playAnnouncerVoice('game_victory.wav');
        }, 3500);
        turnInfo.innerText = "SAVAŞ KAZANILDI! VERİTABANI GÜNCELLENDİ.";
        turnInfo.style.color = "#66fcf1";
    } else {
        setTimeout(() => {
            showFlash("Tüm gemilerimizi kaybettik... Karargahı tahliye edin.", "#ff3b30", true);
            playAnnouncerVoice('game_defeat.wav');
        }, 3500);
        turnInfo.innerText = "SAVAŞ KAYBEDİLDİ! VERİTABANI GÜNCELLENDİ.";
        turnInfo.style.color = "#ff3b30";
    }
});

socket.on('room_error', msg => addLog("HATA: " + msg));
socket.on('validation_error', msg => addLog("HATA: " + msg));
socket.on('opponent_disconnected', msg => {
    if (GAME_PHASE !== 'GAMEOVER') {
        showFlash("AĞ KOPTU\nDüşman Kaçtı", "#ffcc00", true);
    }
    addLog("AĞ KOPTU: " + msg);
});

function addLog(message) {
    const li = document.createElement('li');
    li.innerText = `[${new Date().toLocaleTimeString('tr-TR', { hour12: false })}] ${message}`;
    logList.prepend(li);
}




let enemySubSunk = false;
let friendlySubSunk = false;

function playAnnouncerVoice(eventName) {
    if (!isSfxEnabled || !eventName) return;
    const audio = new Audio(`assets/sounds/${eventName}`);
    audio.volume = 1.0;
    audio.play().catch(e => console.warn("Ses dosyası oynatılamadı:", eventName));
}

function getShipLengthFromName(name) {
    const lower = name.toLowerCase();
    if(lower.includes('uçak')) return 5;
    if(lower.includes('kruvazör')) return 4;
    if(lower.includes('denizaltı') || lower.includes('muhrip')) return 3;
    if(lower.includes('hücum')) return 2;
    return 3; 
}

function getShipDestroyedMessage(isEnemy, shipName) {
    const length = getShipLengthFromName(shipName);
    if(isEnemy) {
        if(length === 5) return { msg: "Kritik vuruş! Düşman uçak gemisi batırıldı!", event: "enemy_ucak_gemisi.wav" };
        if(length === 4) return { msg: "Düşman kruvazörü yok edildi.", event: "enemy_kruvazor.wav" };
        if(length === 3) {
            if (!enemySubSunk) {
                enemySubSunk = true;
                return { msg: "Düşman denizaltısı sulara gömüldü.", event: "enemy_denizalti.wav" };
            } else {
                return { msg: "Düşman muhribi imha edildi.", event: "enemy_muhrip.wav" };
            }
        }
        if(length === 2) return { msg: "Düşman hücum botu etkisiz hale getirildi.", event: "enemy_hucum_botu.wav" };
    } else {
        if(length === 5) return { msg: "Uçak gemimiz sulara gömüldü, hava desteğini kaybettik!", event: "ally_ucak_gemisi.wav" };
        if(length === 4) return { msg: "Kruvazörümüz imha edildi.", event: "ally_kruvazor.wav" };
        if(length === 3) {
            if (!friendlySubSunk) {
                friendlySubSunk = true;
                return { msg: "Denizaltımızla sonar bağlantısı kesildi.", event: "ally_denizalti.wav" };
            } else {
                return { msg: "Muhribimiz ağır hasar aldı ve batıyor.", event: "ally_muhrip.wav" };
            }
        }
        if(length === 2) return { msg: "Hücum botumuzu kaybettik.", event: "ally_hucum_botu.wav" };
    }
    return { msg: `${shipName} battı!`, event: "" };
}





function generateBotFleet() {
    botFleet = [];
    const shipLengths = [
        { type: "Uçak Gemisi", length: 5 },
        { type: "Kruvazör", length: 4 },
        { type: "Muhrip", length: 3 },
        { type: "Denizaltı", length: 3 },
        { type: "Hücumbot", length: 2 }
    ];

    for (const s of shipLengths) {
        let placed = false;
        while (!placed) {
            const dir = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);

            if (dir === 'horizontal' && x + s.length > 10) continue;
            if (dir === 'vertical' && y + s.length > 10) continue;

            let overlap = false;
            let currentTiles = [];
            for (let i = 0; i < s.length; i++) {
                const tx = dir === 'horizontal' ? x + i : x;
                const ty = dir === 'vertical' ? y + i : y;
                currentTiles.push({ x: tx, y: ty });

                for (const bs of botFleet) {
                    for (const bt of bs.tiles) {
                        if (bt.x === tx && bt.y === ty) {
                            overlap = true;
                            break;
                        }
                    }
                    if (overlap) break;
                }
                if (overlap) break;
            }

            if (!overlap) {
                botFleet.push({
                    type: s.type,
                    length: s.length,
                    hitCount: 0,
                    tiles: currentTiles,
                    direction: dir,
                    gridPos: { x: x, y: y }
                });
                placed = true;
            }
        }
    }
}

function processBotModeShot(x, y) {
    let isHit = false;
    let sunkShipName = null;
    let sunkShipInfo = null;
    let botFleetDestroyed = false;

    for (const ship of botFleet) {
        if (ship.tiles.some(t => t.x === x && t.y === y)) {
            isHit = true;
            ship.hitCount++;
            if (ship.hitCount >= ship.length) {
                sunkShipName = ship.type;
                sunkShipInfo = { x: ship.gridPos.x, y: ship.gridPos.y, direction: ship.direction };
            }
            break;
        }
    }

    if (sunkShipName) {
        botFleetDestroyed = botFleet.every(s => s.hitCount >= s.length);
    }

    playSound(sndIslik);
    createRocketEffect(x, y, myShotsGroup, () => {
        isAnimating = false;

        if (isHit) {
            createPeg(x, y, true, myShotsGroup);
            createExplosionEffect(x, y, myShotsGroup);
            playSound(sndExplosion);
            addLog(`>> İSABET! (${x}, ${y}) Hedef Vuruldu!`);

            if (sunkShipName) {
                const info = getShipDestroyedMessage(true, sunkShipName);
                showFlash(info.msg, "#66fcf1");
                playAnnouncerVoice(info.event);
                if (sunkShipInfo) {
                    revealAndSinkEnemyShip(sunkShipName, sunkShipInfo);
                }
            } else {
                showFlash("İSABET! 🔥", "#ff3b30");
            }

            if (botFleetDestroyed) {
                GAME_PHASE = 'GAMEOVER';
                currentTurn = false;
                stopTurnTimer();
                setTimeout(() => {
                    showFlash("Düşman donanması tamamen imha edildi. Görev başarılı.", "#66fcf1", true);
                    playAnnouncerVoice('game_victory.wav');
                }, 3500);
                turnInfo.innerText = "SAVAŞ KAZANILDI! BOT MAĞLUP EDİLDİ.";
                turnInfo.style.color = "#66fcf1";
                return;
            }
        } else {
            createPeg(x, y, false, myShotsGroup);
            createSplashEffect(x, y, myShotsGroup);
            playSound(sndSplash);
            addLog(`>> Iska. (${x}, ${y}) Suya düştü.`);
            showFlash("ISKA", "#cccccc");
        }

        currentTurn = false;
        turnInfo.style.color = "#ff3b30";
        turnInfo.innerText = "Yapay Zeka Atışa Hazırlanıyor...";
        setTimeout(botTurn, 2000);
    });
}

function botTurn() {
    if (GAME_PHASE !== 'BATTLE') return;

    let targetX, targetY;
    let validShot = false;

    while (!validShot) {
        if (botHits.length > 0) {
            const lastHit = botHits[botHits.length - 1];
            const adjacents = [
                { x: lastHit.x + 1, y: lastHit.y },
                { x: lastHit.x - 1, y: lastHit.y },
                { x: lastHit.x, y: lastHit.y + 1 },
                { x: lastHit.x, y: lastHit.y - 1 }
            ].filter(p => p.x >= 0 && p.x < 10 && p.y >= 0 && p.y < 10);

            adjacents.sort(() => Math.random() - 0.5);

            let foundAdj = false;
            for (const adj of adjacents) {
                if (!botShotHistory.has(`${adj.x},${adj.y}`)) {
                    targetX = adj.x;
                    targetY = adj.y;
                    validShot = true;
                    foundAdj = true;
                    break;
                }
            }

            if (!foundAdj) {
                botHits.pop();
                continue;
            }
        } else {
            targetX = Math.floor(Math.random() * 10);
            targetY = Math.floor(Math.random() * 10);
            if (!botShotHistory.has(`${targetX},${targetY}`)) {
                validShot = true;
            }
        }
    }

    botShotHistory.add(`${targetX},${targetY}`);
    enemyShotHistory.add(`${targetX},${targetY}`);

    let isHit = false;
    let sunkShipName = null;
    let playerFleetDestroyed = false;

    for (const ship of fleet) {
        if (ship.occupies(targetX, targetY)) {
            isHit = true;
            const isSunk = ship.takeDamage();
            if (isSunk) {
                sunkShipName = ship.type;
            }
            break;
        }
    }

    playSound(sndIslik);
    createRocketEffect(targetX, targetY, enemyShotsGroup, () => {
        if (isHit) {
            botHits.push({ x: targetX, y: targetY });
            createPeg(targetX, targetY, true, enemyShotsGroup);
            createExplosionEffect(targetX, targetY, enemyShotsGroup);
            playSound(sndExplosion);
            addLog(`>> BOT (${targetX}, ${targetY}) VURDU! Gemimiz İsabet Aldı!`);

            if (sunkShipName) {
                playerFleetDestroyed = fleet.every(s => s.isSunk());
                const info = getShipDestroyedMessage(false, sunkShipName);
                showFlash(info.msg, "#ff3b30");
                playAnnouncerVoice(info.event);
                botHits = [];
            } else {
                showFlash("GEMİMİZ VURULDU! 💥", "#ff3b30");
            }

            if (playerFleetDestroyed) {
                GAME_PHASE = 'GAMEOVER';
                currentTurn = false;
                stopTurnTimer();
                setTimeout(() => {
                    showFlash("Tüm gemilerimizi kaybettik... Karargahı tahliye edin.", "#ff3b30", true);
                    playAnnouncerVoice('game_defeat.wav');
                }, 3500);
                turnInfo.innerText = "SAVAŞ KAYBEDİLDİ! BOT KAZANDI.";
                turnInfo.style.color = "#ff3b30";
                return;
            }
        } else {
            createPeg(targetX, targetY, false, enemyShotsGroup);
            createSplashEffect(targetX, targetY, enemyShotsGroup);
            playSound(sndSplash);
            addLog(`>> Bot (${targetX}, ${targetY}) ıskaladı.`);
            showFlash("Bot Iskaladı", "#a0d8ef");
        }

        currentTurn = true;
        turnInfo.style.color = "#66fcf1";
        turnInfo.innerText = ">> SIRA SİZDE! Kırmızı Bölgede Hedef Seçin. <<";
        startTurnTimer();
    });
}





const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 70);

const radarCamera = new THREE.OrthographicCamera(-55, 55, 55, -55, 1, 1000);
radarCamera.position.set(0, 150, 0);
radarCamera.lookAt(0, 0, 0);

const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();

const sndExplosion = new THREE.Audio(listener);
const sndSplash = new THREE.Audio(listener);
const sndMenu = new THREE.Audio(listener);
const sndIslik = new THREE.Audio(listener);

audioLoader.load('assets/sounds/patlama.wav', (buffer) => { sndExplosion.setBuffer(buffer); sndExplosion.setVolume(1.0); }, undefined, () => console.warn("patlama.wav yok"));
audioLoader.load('assets/sounds/su.wav', (buffer) => { sndSplash.setBuffer(buffer); sndSplash.setVolume(0.8); }, undefined, () => console.warn("su.wav yok"));
audioLoader.load('assets/sounds/menu.wav', (buffer) => { sndMenu.setBuffer(buffer); sndMenu.setLoop(true); sndMenu.setVolume(0.5); }, undefined, () => console.warn("menu.wav yok (isteğe bağlı)"));
audioLoader.load('assets/sounds/islik.wav', (buffer) => { sndIslik.setBuffer(buffer); sndIslik.setVolume(1.0); }, undefined, () => console.warn("islik.wav yok"));

function playSound(audioSrc) {
    if (!isSfxEnabled && audioSrc !== sndMenu) return;
    if (!isMusicEnabled && audioSrc === sndMenu) return;

    if (audioSrc.buffer) {
        if (audioSrc.isPlaying) audioSrc.stop();
        audioSrc.play();
    }
}


document.body.addEventListener('pointerdown', () => {
    if (!userInteracted) {
        userInteracted = true;
        if (listener.context.state === 'suspended') listener.context.resume();
        if (isMusicEnabled && GAME_PHASE !== 'BATTLE' && !sndMenu.isPlaying) playSound(sndMenu);
    }
}, { once: true });

btnSettings.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});
btnCloseSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

btnToggleMusic.addEventListener('click', () => {
    isMusicEnabled = !isMusicEnabled;
    btnToggleMusic.innerText = isMusicEnabled ? "AÇIK" : "KAPALI";
    if (!isMusicEnabled) {
        if (sndMenu.isPlaying) sndMenu.stop();
    } else {
        if (GAME_PHASE !== 'BATTLE' && !sndMenu.isPlaying && userInteracted) {
            playSound(sndMenu);
        }
    }
});

btnToggleSfx.addEventListener('click', () => {
    isSfxEnabled = !isSfxEnabled;
    btnToggleSfx.innerText = isSfxEnabled ? "AÇIK" : "KAPALI";
});

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.autoClear = false;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.mouseButtons = { LEFT: THREE.MOUSE.NONE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
scene.add(dirLight);

const GRID_DIVISIONS = 10;
const GRID_SIZE = 100;
const TILE_SIZE = GRID_SIZE / GRID_DIVISIONS;


const waterGeo = new THREE.PlaneGeometry(1000, 1000, 64, 64);
const waterMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0.0 } },
    vertexShader: `
        uniform float uTime;
        varying vec3 vWorldPosition;
        void main() {
            vec3 pos = position;
            pos.z += sin(pos.x * 0.1 + uTime) * 1.5;
            pos.z += cos(pos.y * 0.08 + uTime) * 1.5;
            vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vWorldPosition;
        void main() {
            float h = (vWorldPosition.y + 3.0) / 6.0;
            vec3 deep = vec3(0.0, 0.3, 0.6); 
            vec3 shallow = vec3(0.0, 0.6, 0.8); 
            vec3 finalColor = mix(deep, shallow, clamp(h, 0.0, 1.0));
            gl_FragColor = vec4(finalColor, 0.9); 
        }
    `,
    transparent: true,
    side: THREE.DoubleSide
});
const waterPlane = new THREE.Mesh(waterGeo, waterMat);
waterPlane.rotation.x = -Math.PI / 2;
scene.add(waterPlane);

const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS, 0x66fcf1, 0x1f2833);
gridHelper.position.y = 0.5;
scene.add(gridHelper);


function createTextSprite(text, fontSize = 70) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 128, 128);
    ctx.font = `bold ${fontSize}px Courier New`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#66fcf1';

    
    ctx.shadowColor = '#66fcf1';
    ctx.shadowBlur = 10;

    ctx.fillText(text, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 999; 
    return sprite;
}

function addGridCoordinates() {
    
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const padding = 7; 
    const initialPos = - (GRID_SIZE / 2) + (TILE_SIZE / 2);

    for (let i = 0; i < GRID_DIVISIONS; i++) {
        const offset = initialPos + (i * TILE_SIZE);

        
        const spriteLetterTop = createTextSprite(letters[i]);
        spriteLetterTop.position.set(offset, 1, - (GRID_SIZE / 2) - padding);
        spriteLetterTop.scale.set(7, 7, 1);
        scene.add(spriteLetterTop);

        const spriteLetterBottom = createTextSprite(letters[i]);
        spriteLetterBottom.position.set(offset, 1, (GRID_SIZE / 2) + padding);
        spriteLetterBottom.scale.set(7, 7, 1);
        scene.add(spriteLetterBottom);

        
        const spriteNumLeft = createTextSprite((i + 1).toString());
        spriteNumLeft.position.set(- (GRID_SIZE / 2) - padding, 1, offset);
        spriteNumLeft.scale.set(7, 7, 1);
        scene.add(spriteNumLeft);

        const spriteNumRight = createTextSprite((i + 1).toString());
        spriteNumRight.position.set((GRID_SIZE / 2) + padding, 1, offset);
        spriteNumRight.scale.set(7, 7, 1);
        scene.add(spriteNumRight);
    }
}
addGridCoordinates(); 

const dragPlane = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshBasicMaterial({ visible: false }));
dragPlane.rotation.x = -Math.PI / 2;
scene.add(dragPlane);

const myShotsGroup = new THREE.Group();
scene.add(myShotsGroup);

const enemyShotsGroup = new THREE.Group();
scene.add(enemyShotsGroup);





const gltfLoader = new GLTFLoader();

class Ship {
    constructor(id, type, length, filename) {
        this.id = id;
        this.type = type;
        this.length = length;
        this.hitCount = 0;
        this.filename = filename;
        this.direction = 'horizontal';
        this.gridPos = { x: null, y: null };
        this.isPlaced = false;

        this.mesh = new THREE.Group();
        this.mesh.userData = { isShip: true, shipRef: this };

        this.loadModel();
        scene.add(this.mesh);
    }

    takeDamage() {
        this.hitCount++;
        const sunk = this.isSunk();
        if (sunk) {
            this.playSinkingAnimation();
        }
        return sunk;
    }

    playSinkingAnimation() {
        const sinkInterval = setInterval(() => {
            if (!this.mesh) {
                clearInterval(sinkInterval);
                return;
            }
            
            this.mesh.position.y -= 0.1;
            this.mesh.rotation.z += 0.01; 

            if (this.mesh.position.y <= -20) {
                clearInterval(sinkInterval);
                this.mesh.visible = false;
            }
        }, 30);
    }

    isSunk() {
        return this.hitCount >= this.length;
    }

    loadModel() {
        gltfLoader.load(
            `assets/models/${this.filename}`,
            (gltf) => {
                const model = gltf.scene;

                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.z);
                const targetSize = (this.length * TILE_SIZE) - 2;

                if (maxDim > 0) {
                    const scaleFactor = targetSize / maxDim;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                }

                if (size.z > size.x) {
                    model.rotation.y = Math.PI / 2;
                }

                const newBox = new THREE.Box3().setFromObject(model);
                const center = newBox.getCenter(new THREE.Vector3());
                model.position.sub(center);
                model.position.y += Math.abs((newBox.max.y - newBox.min.y) / 2) + 0.5;

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.mesh.add(model);
            },
            undefined,
            (err) => {
                const fallbackGeo = new THREE.BoxGeometry(this.length * TILE_SIZE - 2, 4, 8);
                const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xff0000, wireframe: true });
                const box = new THREE.Mesh(fallbackGeo, fallbackMat);
                box.position.y = 2;
                this.mesh.add(box);
            }
        );
    }

    getOccupiedTiles() {
        if (this.gridPos.x === null || this.gridPos.y === null) return [];
        let tiles = [];
        for (let i = 0; i < this.length; i++) {
            if (this.direction === 'horizontal') tiles.push({ x: this.gridPos.x + i, y: this.gridPos.y });
            else tiles.push({ x: this.gridPos.x, y: this.gridPos.y + i });
        }
        return tiles;
    }

    occupies(x, y) {
        return this.getOccupiedTiles().some(t => t.x === x && t.y === y);
    }

    setPosition(x, y) {
        this.gridPos = { x, y };
        const offset = (this.length * TILE_SIZE) / 2;
        let worldX = - (GRID_SIZE / 2) + (x * TILE_SIZE);
        let worldZ = - (GRID_SIZE / 2) + (y * TILE_SIZE);

        if (this.direction === 'horizontal') {
            worldX += offset;
            worldZ += TILE_SIZE / 2;
        } else {
            worldX += TILE_SIZE / 2;
            worldZ += offset;
        }

        this.mesh.position.set(worldX, 0, worldZ);
    }

    rotate() {
        this.direction = (this.direction === 'horizontal') ? 'vertical' : 'horizontal';
        this.mesh.rotation.y -= Math.PI / 2;
    }
}

const fleet = [
    new Ship(1, "Uçak Gemisi", 5, "ucak_gemisi.glb"),
    new Ship(2, "Kruvazör", 4, "kruvazor.glb"),
    new Ship(3, "Muhrip", 3, "muhrip.glb"),
    new Ship(4, "Denizaltı", 3, "denizalti.glb"),
    new Ship(5, "Hücumbot", 2, "hucum_botu.glb")
];

function revealShipsInDock() {
    let startZ = -40;
    fleet.forEach(ship => {
        ship.direction = 'horizontal';
        ship.gridPos = { x: -10, y: -10 };
        ship.mesh.position.set(-65, 0, startZ);
        ship.mesh.rotation.y = 0;
        startZ += 15;
    });
}

revealShipsInDock();



const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedShip = null;

function checkPlacement(ship, gridX, gridY) {
    
    if (gridX < 0 || gridY < 0) return false;
    if (ship.direction === 'horizontal' && gridX + ship.length > 10) return false;
    if (ship.direction === 'vertical' && gridY + ship.length > 10) return false;

    let targetTiles = [];
    for (let i = 0; i < ship.length; i++) {
        if (ship.direction === 'horizontal') targetTiles.push({ x: gridX + i, y: gridY });
        else targetTiles.push({ x: gridX, y: gridY + i });
    }

    
    for (const otherShip of fleet) {
        if (otherShip === ship || !otherShip.isPlaced) continue;
        const otherTiles = otherShip.getOccupiedTiles();
        for (const t1 of targetTiles) {
            for (const t2 of otherTiles) {
                if (t1.x === t2.x && t1.y === t2.y) return false; 
            }
        }
    }
    return true;
}

function validateFleet() {
    const allPlaced = fleet.every(s => s.isPlaced);
    if (allPlaced) {
        btnReady.disabled = false;
        btnReady.classList.remove('disabled');
        placementStatus.innerText = "Tüm gemiler kilitlendi! Lütfen SAVAŞA HAZIR butonunu tuşlayın.";
        placementStatus.style.color = "#66fcf1";
    } else {
        btnReady.disabled = true;
        btnReady.classList.add('disabled');
        placementStatus.innerText = "Eksik Gemiler Var: Bütün filoyu tahtaya yerleştiriniz.";
        placementStatus.style.color = "#ff3b30";
    }
}

window.addEventListener('contextmenu', e => e.preventDefault());

window.addEventListener('pointerdown', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (e.button === 2 && GAME_PHASE === 'PLACEMENT') {
        if (selectedShip) {
            selectedShip.rotate();
            return;
        }
        const shipMeshes = fleet.map(s => s.mesh);
        const intersects = raycaster.intersectObjects(shipMeshes, true);
        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj && !obj.userData.isShip) obj = obj.parent;
            if (obj && obj.userData.isShip) {
                const targetShip = obj.userData.shipRef;
                targetShip.rotate();
                if (targetShip.isPlaced) {
                    targetShip.isPlaced = false;
                    if (checkPlacement(targetShip, targetShip.gridPos.x, targetShip.gridPos.y)) {
                        targetShip.isPlaced = true;
                        targetShip.setPosition(targetShip.gridPos.x, targetShip.gridPos.y);
                    } else {
                        targetShip.gridPos = { x: -10, y: -10 };
                        targetShip.mesh.position.set(-65, 0, (targetShip.id * 15) - 40);
                    }
                    validateFleet();
                }
            }
        }
        return;
    }

    if (e.button !== 0) return;

    if (GAME_PHASE === 'PLACEMENT') {
        const shipMeshes = fleet.map(s => s.mesh);
        const intersects = raycaster.intersectObjects(shipMeshes, true);

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj && !obj.userData.isShip) obj = obj.parent;
            if (obj && obj.userData.isShip) {
                selectedShip = obj.userData.shipRef;
                selectedShip.isPlaced = false;
                controls.enabled = false;
                validateFleet();
            }
        }
    }
    else if (GAME_PHASE === 'BATTLE') {
        
        if (!currentTurn || isAnimating) return;

        const gridHit = raycaster.intersectObject(dragPlane);
        if (gridHit.length > 0) {
            const hitPoint = gridHit[0].point;
            const gridX = Math.floor((hitPoint.x + GRID_SIZE / 2) / TILE_SIZE);
            const gridY = Math.floor((hitPoint.z + GRID_SIZE / 2) / TILE_SIZE);

            if (gridX >= 0 && gridX < 10 && gridY >= 0 && gridY < 10) {
                const shotKey = `${gridX},${gridY}`;
                
                if (myShotHistory.has(shotKey)) {
                    showFlash("BURAYA ZATEN\nATEŞ ETTİNİZ", "#ffcc00");
                    return;
                }

                myShotHistory.add(shotKey);

                
                currentTurn = false;
                isAnimating = true; 
                stopTurnTimer();

                if (isBotMode) {
                    processBotModeShot(gridX, gridY);
                } else {
                    socket.emit('shoot', { roomId: myRoomId, x: gridX, y: gridY });
                }
            }
        }
    }
});

window.addEventListener('pointermove', (e) => {
    if (selectedShip && GAME_PHASE === 'PLACEMENT') {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(dragPlane);
        if (intersects.length > 0) {
            const pt = intersects[0].point;
            selectedShip.mesh.position.x = pt.x;
            selectedShip.mesh.position.z = pt.z;
        }
    }
});

window.addEventListener('pointerup', () => {
    if (selectedShip && GAME_PHASE === 'PLACEMENT') {
        const pt = selectedShip.mesh.position;
        const offset = (selectedShip.length * TILE_SIZE) / 2;
        let baseX = pt.x;
        let baseZ = pt.z;

        if (selectedShip.direction === 'horizontal') {
            baseX -= offset; baseZ -= TILE_SIZE / 2;
        } else {
            baseX -= TILE_SIZE / 2; baseZ -= offset;
        }

        const gridX = Math.round((baseX + GRID_SIZE / 2) / TILE_SIZE);
        const gridY = Math.round((baseZ + GRID_SIZE / 2) / TILE_SIZE);

        if (checkPlacement(selectedShip, gridX, gridY)) {
            selectedShip.setPosition(gridX, gridY);
            selectedShip.isPlaced = true;
        } else {
            selectedShip.gridPos = { x: -10, y: -10 };
            selectedShip.mesh.position.set(-65, 0, (selectedShip.id * 15) - 40);
        }

        validateFleet();
        selectedShip = null;
        controls.enabled = true;
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        if (selectedShip && GAME_PHASE === 'PLACEMENT') selectedShip.rotate();
    }
});





function createPeg(gridX, gridY, isHit, targetGroup) {
    const worldX = gridX * TILE_SIZE - (GRID_SIZE / 2) + (TILE_SIZE / 2);
    const worldZ = gridY * TILE_SIZE - (GRID_SIZE / 2) + (TILE_SIZE / 2);

    const geo = new THREE.SphereGeometry(2, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
        color: isHit ? 0xff0000 : 0xdddddd,
        roughness: isHit ? 0.2 : 0.8,
        metalness: isHit ? 0.3 : 0.0
    });
    const peg = new THREE.Mesh(geo, mat);
    peg.position.set(worldX, 0, worldZ);
    peg.castShadow = true;
    peg.position.y = 1;
    targetGroup.add(peg);
}

const ROCKET_FALL_DURATION = 1500; 

function createRocketEffect(gridX, gridY, targetGroup, onComplete) {
    const worldX = gridX * TILE_SIZE - (GRID_SIZE / 2) + (TILE_SIZE / 2);
    const worldZ = gridY * TILE_SIZE - (GRID_SIZE / 2) + (TILE_SIZE / 2);

    
    const rocketGroup = new THREE.Group();

    
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.5;

    
    const noseGeo = new THREE.ConeGeometry(0.5, 1.5, 8);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xff3b30, metalness: 0.3, roughness: 0.5 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.y = 3.75;

    
    const fireGeo = new THREE.SphereGeometry(0.6, 8, 8);
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.8 });
    const fire = new THREE.Mesh(fireGeo, fireMat);
    fire.position.y = -0.2;

    
    const fireLight = new THREE.PointLight(0xffaa00, 1.5, 20);
    fireLight.position.y = -0.5;

    rocketGroup.add(body);
    rocketGroup.add(nose);
    rocketGroup.add(fire);
    rocketGroup.add(fireLight);

    
    rocketGroup.rotation.x = Math.PI; 
    rocketGroup.position.set(worldX, 60, worldZ); 
    targetGroup.add(rocketGroup);

    const startTime = Date.now();
    let ticks = 0;

    const inter = setInterval(() => {
        const elapsed = Date.now() - startTime;
        let progress = elapsed / ROCKET_FALL_DURATION;
        if (progress >= 1) progress = 1;

        
        const dropY = 60 - (59 * progress);
        rocketGroup.position.y = dropY;

        
        ticks++;
        const fireScale = 1.0 + Math.sin(ticks * 0.8) * 0.3;
        fire.scale.set(fireScale, fireScale, fireScale);

        if (progress === 1) {
            clearInterval(inter);
            targetGroup.remove(rocketGroup);

            
            if (sndIslik.isPlaying) sndIslik.stop();

            if (onComplete) onComplete();
        }
    }, 15);
}

function createExplosionEffect(gridX, gridY, targetGroup) {
    const worldX = gridX * TILE_SIZE - (GRID_SIZE / 2) + (TILE_SIZE / 2);
    const worldZ = gridY * TILE_SIZE - (GRID_SIZE / 2) + (TILE_SIZE / 2);

    const geo = new THREE.SphereGeometry(2.5, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff3b30, wireframe: true });
    const explosion = new THREE.Mesh(geo, mat);
    explosion.position.set(worldX, 3, worldZ);
    targetGroup.add(explosion);

    let scale = 1.0;
    const interval = setInterval(() => {
        scale += 0.3;
        explosion.scale.set(scale, scale, scale);
        explosion.material.opacity -= 0.1;
        if (scale > 5.5) {
            clearInterval(interval);
            targetGroup.remove(explosion);
        }
    }, 30);
}

function createSplashEffect(gridX, gridY, targetGroup) {
    const worldX = gridX * TILE_SIZE - (GRID_SIZE / 2) + (TILE_SIZE / 2);
    const worldZ = gridY * TILE_SIZE - (GRID_SIZE / 2) + (TILE_SIZE / 2);

    const geo = new THREE.BufferGeometry();
    const count = 35;
    const posList = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
        posList[i] = worldX + (Math.random() - 0.5) * 8;
        posList[i + 1] = 0;
        posList[i + 2] = worldZ + (Math.random() - 0.5) * 8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(posList, 3));

    const mat = new THREE.PointsMaterial({ color: 0xa0d8ef, size: 2.5 });
    const splash = new THREE.Points(geo, mat);
    targetGroup.add(splash);

    let drop = 50;
    const inter = setInterval(() => {
        splash.position.y += 0.5;
        drop--;
        if (drop < 0) {
            clearInterval(inter);
            targetGroup.remove(splash);
        }
    }, 30);
}

function revealAndSinkEnemyShip(shipName, shipInfo) {
    let filename = "";
    let shipLength = 3;
    const lowerName = shipName.toLowerCase();

    if (lowerName.includes("uçak")) {
        filename = "ucak_gemisi.glb";
        shipLength = 5;
    } else if (lowerName.includes("kruvazör")) {
        filename = "kruvazor.glb";
        shipLength = 4;
    } else if (lowerName.includes("muhrip")) {
        filename = "muhrip.glb";
        shipLength = 3;
    } else if (lowerName.includes("denizaltı")) {
        filename = "denizalti.glb";
        shipLength = 3;
    } else if (lowerName.includes("hücum")) {
        filename = "hucum_botu.glb";
        shipLength = 2;
    } else {
        return;
    }

    gltfLoader.load(
        `assets/models/${filename}`,
        (gltf) => {
            const model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.z);
            const targetSize = (shipLength * TILE_SIZE) - 2;

            if (maxDim > 0) {
                const scaleFactor = targetSize / maxDim;
                model.scale.set(scaleFactor, scaleFactor, scaleFactor);
            }

            if (size.z > size.x) {
                model.rotation.y = Math.PI / 2;
            }

            const newBox = new THREE.Box3().setFromObject(model);
            const center = newBox.getCenter(new THREE.Vector3());
            model.position.sub(center);
            model.position.y += Math.abs((newBox.max.y - newBox.min.y) / 2) + 0.5;

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const dummyGroup = new THREE.Group();
            dummyGroup.add(model);
            
            if (shipInfo.direction === 'vertical') {
                dummyGroup.rotation.y -= Math.PI / 2;
            }

            const offset = (shipLength * TILE_SIZE) / 2;
            let worldX = - (GRID_SIZE / 2) + (shipInfo.x * TILE_SIZE);
            let worldZ = - (GRID_SIZE / 2) + (shipInfo.y * TILE_SIZE);

            if (shipInfo.direction === 'horizontal') {
                worldX += offset;
                worldZ += TILE_SIZE / 2;
            } else {
                worldX += TILE_SIZE / 2;
                worldZ += offset;
            }

            dummyGroup.position.set(worldX, 0, worldZ);
            myShotsGroup.add(dummyGroup);

            const sinkInterval = setInterval(() => {
                dummyGroup.position.y -= 0.1;
                dummyGroup.rotation.z += 0.01;

                if (dummyGroup.position.y <= -20) {
                    clearInterval(sinkInterval);
                    myShotsGroup.remove(dummyGroup);
                }
            }, 30);
        }
    );
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});




const seagulls = [];
function initSeagulls(count) {
    const wingGeo = new THREE.PlaneGeometry(1.5, 0.4);
    wingGeo.rotateX(-Math.PI / 2);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    for (let i = 0; i < count; i++) {
        const birdGroup = new THREE.Group();

        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.75, 0, 0);
        const leftPivot = new THREE.Group();
        leftPivot.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.75, 0, 0);
        const rightPivot = new THREE.Group();
        rightPivot.add(rightWing);

        birdGroup.add(leftPivot);
        birdGroup.add(rightPivot);

        birdGroup.position.set(
            (Math.random() - 0.5) * 400,
            30 + Math.random() * 20,
            (Math.random() - 0.5) * 400
        );
        birdGroup.rotation.y = Math.random() * Math.PI * 2;

        scene.add(birdGroup);
        seagulls.push({
            group: birdGroup,
            leftWing: leftPivot,
            rightWing: rightPivot,
            speed: 0.2 + Math.random() * 0.2,
            flapSpeed: 0.01 + Math.random() * 0.005,
            flapOffset: Math.random() * Math.PI * 2
        });
    }
}
initSeagulls(12);

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    waterMat.uniforms.uTime.value += 0.015;

    
    seagulls.forEach(bird => {
        bird.group.translateZ(-bird.speed); 

        
        if (bird.group.position.x > 300) bird.group.position.x = -300;
        if (bird.group.position.x < -300) bird.group.position.x = 300;
        if (bird.group.position.z > 300) bird.group.position.z = -300;
        if (bird.group.position.z < -300) bird.group.position.z = 300;

        
        const time = Date.now() * bird.flapSpeed;
        const angle = Math.sin(time + bird.flapOffset) * 0.5;
        bird.leftWing.rotation.z = angle;
        bird.rightWing.rotation.z = -angle;
    });

    renderer.clear();

    if (GAME_PHASE === 'BATTLE' || GAME_PHASE === 'GAMEOVER') {
        fleet.forEach(s => { if (s.mesh) s.mesh.visible = false; });
        myShotsGroup.visible = true;
        enemyShotsGroup.visible = false;
        gridHelper.material.color.setHex(0xff3b30);

        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.setScissorTest(false);
        renderer.render(scene, camera);

        fleet.forEach(s => { if (s.mesh) s.mesh.visible = true; });
        myShotsGroup.visible = false;
        enemyShotsGroup.visible = true;
        gridHelper.material.color.setHex(0x66fcf1);

        
        const radarWidth = isRadarEnlarged ? 500 : 250;
        const radarHeight = isRadarEnlarged ? 500 : 250;
        const radarX = window.innerWidth - radarWidth - 20; 
        const radarY = 20; 

        renderer.setViewport(radarX, radarY, radarWidth, radarHeight);
        renderer.setScissor(radarX, radarY, radarWidth, radarHeight);
        renderer.setScissorTest(true);
        renderer.clearDepth();
        renderer.render(scene, radarCamera);

    } else {
        fleet.forEach(s => { if (s.mesh) s.mesh.visible = true; });
        myShotsGroup.visible = true;
        enemyShotsGroup.visible = true;
        gridHelper.material.color.setHex(0x66fcf1);

        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.setScissorTest(false);
        renderer.render(scene, camera);
    }
}
animate();
