require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { instagramGetUrl } = require('instagram-url-direct');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_ID;

if (!token) {
    console.error('Error: BOT_TOKEN is missing in .env file');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const dbPath = path.join(__dirname, 'database.json');

const getData = () => {
    try {
        if (!fs.existsSync(dbPath)) return { users: [], config: { adminId: adminId || null } };
        const content = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(content || '{"users": [], "config": {}}');
    } catch (err) {
        console.error('Error reading database:', err);
        return { users: [], config: { adminId: adminId || null } };
    }
};

const saveData = (data) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
    } catch (err) {
        console.error('Error saving database:', err);
    }
};

// Global error handler to prevent crash
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection at:', promise, 'reason:', reason));

if (!fs.existsSync(dbPath)) {
    saveData({ users: [], config: { adminId: adminId || null } });
}

console.log('🚀 Admin Bot is running...');

// Helper to check if user is admin
const isAdmin = (msg) => {
    const data = getData();
    return msg.from.id.toString() === data.config.adminId?.toString();
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const data = getData();

    // Auto-setup admin if not set
    if (!data.config.adminId) {
        data.config.adminId = userId;
        saveData(data);
        bot.sendMessage(chatId, `✨ **Siz bot administratori sifatida tayinlandingiz!**\n\nSiz endi botni boshqarishingiz mumkin.`, { parse_mode: 'Markdown' });
        return;
    }

    // Add user to database if not exists
    if (!data.users.includes(userId)) {
        data.users.push(userId);
        saveData(data);
    }

    if (isAdmin(msg)) {
        bot.sendMessage(chatId, `👋 **Salom, Admin!**\n\nQuyidagi buyruqlardan foydalanishingiz mumkin:\n📊 /stats - Foydalanuvchilar soni\n📢 /broadcast - Xabar yuborish\n\nInstagram havolasini yuborsangiz, bot uni yuklab beradi.`, { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(chatId, `👋 **Assalomu alaykum!**\n\nInstagramdan video yuklash uchun havolani yuboring. 🚀`, { parse_mode: 'Markdown' });
    }
});

bot.onText(/\/stats/, (msg) => {
    if (!isAdmin(msg)) return;
    const data = getData();
    bot.sendMessage(msg.chat.id, `📊 **Bot statistikasi:**\n\n👤 Jami foydalanuvchilar: ${data.users.length}`, { parse_mode: 'Markdown' });
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    if (!isAdmin(msg)) return;
    const text = match[1];
    const data = getData();
    let count = 0;

    const statusMsg = await bot.sendMessage(msg.chat.id, `⏳ **Xabar yuborilmoqda...**`, { parse_mode: 'Markdown' });

    for (const userId of data.users) {
        try {
            await bot.sendMessage(userId, text);
            count++;
            // Small delay to avoid rate limit
            await new Promise(resolve => setTimeout(resolve, 50)); 
        } catch (err) {
            console.error(`Could not send message to ${userId}`);
        }
    }

    bot.editMessageText(`✅ **Xabar yuborildi!**\n\n👥 Qabul qildi: ${count} ta foydalanuvchi.`, {
        chat_id: msg.chat.id,
        message_id: statusMsg.message_id,
        parse_mode: 'Markdown'
    });
});

// Memory storage for message mapping
const messageMap = new Map();

// Handle incoming messages for communication
// Express server for Render keep-alive
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running! 🚀'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return; // Ignore commands

    // Instagram Downloader Logic
    if (msg.text && (msg.text.includes('instagram.com/reel/') || msg.text.includes('instagram.com/p/') || msg.text.includes('instagram.com/reels/'))) {
        const url = msg.text.match(/https?:\/\/(www\.)?instagram\.com\/(reel|p|reels)\/[a-zA-Z0-9_-]+\/?/)?.[0];
        
            console.log('Processing Instagram URL:', url);
            const waitMsg = await bot.sendMessage(msg.chat.id, '⏳ **Video yuklanmoqda...**', { parse_mode: 'Markdown' });
            
            try {
                let videoUrl = null;
                
                // Method 1: instagram-url-direct
                try {
                    const results = await instagramGetUrl(url);
                    if (results && results.url_list && results.url_list.length > 0) {
                        videoUrl = results.url_list[0];
                    }
                } catch (e) {
                    console.log('Method 1 failed:', e.message);
                }

                // Method 2: TiklyDown API (Robust backup)
                if (!videoUrl) {
                    try {
                        const tiklyRes = await axios.get(`https://api.tiklydown.eu.org/api/download/instagram?url=${encodeURIComponent(url)}`, {
                            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                            timeout: 10000
                        });
                        if (tiklyRes.data && tiklyRes.data.url) {
                            videoUrl = tiklyRes.data.url;
                        } else if (tiklyRes.data && tiklyRes.data.result && tiklyRes.data.result.url) {
                            videoUrl = tiklyRes.data.result.url;
                        }
                    } catch (e) {
                        console.log('Method 2 failed');
                    }
                }
                
                // Method 3: Vyturex API
                if (!videoUrl) {
                    try {
                        const backupRes = await axios.get(`https://api.vyturex.com/ig?url=${encodeURIComponent(url)}`, { timeout: 10000 });
                        if (backupRes.data && backupRes.data.url) {
                            videoUrl = backupRes.data.url;
                        }
                    } catch (e) {
                        console.log('Method 3 failed');
                    }
                }

                if (videoUrl) {
                    await bot.sendVideo(msg.chat.id, videoUrl, {
                        caption: '✅ **Tayyor!**\n\n@' + (bot.options.username || 'bot'),
                        parse_mode: 'Markdown'
                    });
                    bot.deleteMessage(msg.chat.id, waitMsg.message_id);
                } else {
                    bot.editMessageText('❌ **Xatolik:** Videoni yuklab bo\'lmadi. Havola noto\'g\'ri, profil yopiq yoki botda vaqtinchalik muammo.', {
                        chat_id: msg.chat.id,
                        message_id: waitMsg.message_id
                    });
                }
            } catch (err) {
                console.error('Download error:', err);
                bot.editMessageText('❌ **Xatolik:** Yuklashda xatolik yuz berdi. Iltimos, birozdan so\'ng qayta urinib ko\'ring.', {
                    chat_id: msg.chat.id,
                    message_id: waitMsg.message_id
                });
            }
            return;
        }
    }

    const data = getData();
    const admin = data.config.adminId;

    if (isAdmin(msg)) {
        // Admin replying to a user
        if (msg.reply_to_message) {
            const targetUserId = messageMap.get(msg.reply_to_message.message_id);

            if (targetUserId) {
                try {
                    if (msg.text) {
                        await bot.sendMessage(targetUserId, `📩 **Admin javobi:**\n\n${msg.text}`, { parse_mode: 'Markdown' });
                    } else {
                        await bot.copyMessage(targetUserId, msg.chat.id, msg.message_id, {
                            caption: `📩 **Admin javobi**`
                        });
                    }
                    bot.sendMessage(admin, '✅ Javob yuborildi.');
                } catch (err) {
                    bot.sendMessage(admin, '❌ Xatolik yuz berdi.');
                }
            }
        }
    } else {
        // User sending message to admin
        if (admin) {
            try {
                const forwarded = await bot.forwardMessage(admin, msg.chat.id, msg.message_id);
                messageMap.set(forwarded.message_id, msg.from.id);
                
                // Clear old mappings to save memory (after 48 hours)
                setTimeout(() => messageMap.delete(forwarded.message_id), 48 * 60 * 60 * 1000);

                bot.sendMessage(msg.chat.id, '✅ Xabaringiz adminga yetkazildi.', { parse_mode: 'Markdown' });
            } catch (err) {
                console.error('Forward error:', err);
            }
        }
    }
});
