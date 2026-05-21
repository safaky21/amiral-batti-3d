# 🇬🇧 English Version

# Battleship 3D: Multiplayer Battleship Web App

## Features
- **3D Graphics Engine:** Hardware-accelerated ocean, ship, and animation systems using Three.js (WebGL).
- **Real-Time Communication:** Near zero-latency synchronization between players using Socket.io.
- **Artificial Intelligence (Bot):** Smart single-player mode featuring a "Hunter Mode" algorithm.
- **Turn Timer:** A fair play system that restricts players to a 30-second turn limit, automatically firing a random shot when time expires to maintain game flow.
- **Persistent Data:** User registration, score, and leaderboard management via an SQLite database.

## Technologies Used (Dependencies)
- **Frontend:** HTML5, CSS3, JavaScript, Three.js
- **Backend:** Node.js, Express.js
- **Network & Communication:** Socket.io
- **Database:** SQLite3

## Installation and Execution
To run the project on your local machine:

1. Clone the repository: `git clone https://github.com/safaky21/amiral-batti-3d.git`
2. Install dependencies: `npm install`
3. Start the server:
   - **For Developers:** Run the `node server.js` command in your terminal.
   - **Quick Start:** Double-click the `oyunubaslat.bat` file located in the root directory. *(Note: The command prompt window that opens must remain running in the background to keep the server online.)*

---

## Gameplay and Test Scenarios

### 1. Single PC / Dual Browser Test (Developer Mode)
If you want to test the multiplayer functionality on a single machine:
1. Open your browser (e.g., Chrome) and go to `http://localhost:3000`. Log in and host a room.
2. Open a second browser (e.g., Edge) or an "Incognito Window" and go to `http://localhost:3000`.
3. Log in with a different username, enter the room code you just created, and test the multiplayer mechanics against yourself.

### 2. Local Area Network (LAN) Multiplayer
To play head-to-head on two different devices connected to the same Wi-Fi or wired network:
1. **Host Computer:** Start the game server. Open the Command Prompt (CMD), type `ipconfig`, and find your local **IPv4 Address** (e.g., `192.168.1.15`). Log in via the browser and host a room.
2. **Guest Computer:** Open the browser on the second device in the same network. Type the host's IP address and port into the address bar (e.g., `http://192.168.1.15:3000`).
3. The guest player can instantly join the battle by entering the room code.
*(Note: If the guest device cannot connect, ensure the host computer's Firewall allows traffic on port 3000.)*

### 3. Vs. AI (Bot Mode)
If you want to practice offline, you can use the "Play vs AI" button in the lobby to fight against a bot equipped with the Hunter Mode algorithm.

---

## Developer
- **Name:** Şafak Yüksel



--------------------------------------------------------------------------------------------------------------------------------------------------



# 🇹🇷 Türkçe Versiyon

# Amiral Battı 3D: Multiplayer Battleship Web App

## Özellikler
- **3D Grafik Altyapısı:** Three.js (WebGL) kullanılarak donanım hızlandırmalı deniz, gemi ve animasyon sistemleri.
- **Gerçek Zamanlı Haberleşme:** Socket.io ile oyuncular arası sıfır gecikmeye yakın (low-latency) senkronizasyon.
- **Yapay Zeka (Bot):** "Avcı Modu" algoritmasına sahip akıllı tek oyunculu mod.
- **Zaman Kısıtı (Turn Timer):** Akıcılığı sağlamak için oyuncuları 30 saniye ile kısıtlayan ve süre bitince otomatik atış yapan adil oyun sistemi.
- **Kalıcı Veri:** SQLite veritabanı ile kullanıcı kayıt, skor ve liderlik tablosu yönetimi.

## Kullanılan Teknolojiler (Bağımlılıklar)
- **Frontend:** HTML5, CSS3, JavaScript, Three.js
- **Backend:** Node.js, Express.js
- **Ağ & İletişim:** Socket.io
- **Veritabanı:** SQLite3

## Kurulum ve Çalıştırma
Projeyi kendi bilgisayarınızda çalıştırmak için:

1. Depoyu klonlayın: `git clone https://github.com/safaky21/amiral-batti-3d.git`
2. Bağımlılıkları yükleyin: `npm install`
3. Sunucuyu başlatın:
   - **Geliştiriciler için:** Terminalde `node server.js` komutunu çalıştırın.
   - **Hızlı Başlatma:** Klasör içindeki `oyunubaslat.bat` dosyasına çift tıklayın. *(Not: Oyunun çalışmaya devam etmesi için açılan bu siyah komut ekranının arka planda hep açık kalması gerekmektedir.)*

---

## Oynanış ve Test Senaryoları

### 1. Tek Bilgisayarda Çift Tarayıcı ile Test (Geliştirici Modu)
Oyunu iki farklı cihaz olmadan, tek bilgisayarda test etmek isterseniz:
1. Tarayıcınızda (örn: Chrome) `http://localhost:3000` adresine gidin. Giriş yapıp bir oda kurun.
2. İkinci bir tarayıcı (örn: Edge) veya aynı tarayıcının "Gizli Sekmesini" (Incognito) açın ve yine `http://localhost:3000` adresine gidin.
3. Farklı bir kullanıcı adıyla giriş yapıp, kurduğunuz oda kodunu girerek kendi kendinize karşılıklı çok oyunculu testler gerçekleştirebilirsiniz.

### 2. Yerel Ağda (LAN) İki Kişilik Oynama
Oyunu aynı Wi-Fi veya kablolu ağa bağlı iki farklı bilgisayarda/cihazda karşılıklı oynamak için:
1. **Sunucu Bilgisayarı (Host):** Oyunu başlatın. Komut istemine (CMD) `ipconfig` yazarak yerel **IPv4 Adresinizi** öğrenin (Örn: `192.168.1.15`). Tarayıcıdan giriş yapıp bir oda kurun.
2. **İkinci Oyuncu (Guest):** Aynı ağdaki diğer cihazın tarayıcısını açın. Adres çubuğuna sunucunun IP adresini ve port numarasını yazın (Örn: `http://192.168.1.15:3000`).
3. İkinci oyuncu aynı oda kodunu girerek savaşa anında dahil olabilir.
*(Not: İkinci cihaz bağlanamazsa, sunucu bilgisayarındaki Güvenlik Duvarı'nın 3000 portuna izin verdiğinden emin olun.)*

### 3. Yapay Zekaya Karşı (Bot Modu)
Ağa bağlanmadan tek başınıza pratik yapmak isterseniz, lobi ekranındaki "Yapay Zekaya Karşı Oyna" butonunu kullanarak Avcı Modu algoritmasına sahip bot ile çarpışabilirsiniz.

---

## Geliştirici
- **Ad Soyad:** Şafak Yüksel
