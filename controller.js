const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

let waClient;
let connectedInfo = null;

function connectWa(req, res) {
	if (waClient && waClient.info && waClient.info.wid) {
		console.log(`Already connected: nomor=${connectedInfo?.nomor}, waktu_connect=${connectedInfo?.waktu_connect}, platform=${connectedInfo?.platform}`);
		return res.json({ status: 'already_connected', info: connectedInfo });
	}
	waClient = new Client({
		authStrategy: new LocalAuth()
	});
	waClient.on('qr', (qr) => {
		qrcode.generate(qr, { small: true });
		console.log('Scan QR di atas dengan WhatsApp Anda.'); // satu baris
	});
	waClient.on('ready', () => {
		const info = {
			nomor: waClient.info.wid.user,
			waktu_connect: new Date().toISOString(),
			platform: waClient.info.platform,
		};
		connectedInfo = info;
		// Simpan ke db.json
		let db = [];
		const dbPath = path.join(__dirname, 'db.json');
		if (fs.existsSync(dbPath)) {
			try {
				db = JSON.parse(fs.readFileSync(dbPath));
			} catch {}
		}
		db.push(info);
		fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
		console.log(`WA Connected: nomor=${info.nomor}, waktu_connect=${info.waktu_connect}, platform=${info.platform}`);
	});
	waClient.initialize();
	console.log('Connecting WA...');
	res.json({ status: 'connecting' });
}

async function sendWa(req, res) {
	const { nomor, pesan } = req.body;
	if (!waClient || !waClient.info || !waClient.info.wid) {
		return res.status(400).json({ error: 'WA belum connect' });
	}
	try {
		const chatId = nomor.includes('@c.us') ? nomor : nomor + '@c.us';
		await waClient.sendMessage(chatId, pesan);
		console.log(`Pesan terkirim: nomor=${nomor}, pesan=${pesan}`);
		res.json({ status: 'sent', nomor, pesan });
	} catch (err) {
		console.log(`Gagal kirim: nomor=${nomor}, pesan=${pesan}, error=${err.message}`);
		res.status(500).json({ error: err.message });
	}
}

module.exports = { connectWa, sendWa };
