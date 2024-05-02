require('dotenv').config();
const { Events, ActivityType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const { parseString } = require('xml2js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		client.user.setPresence({
			status: 'online',
			afk: false,
			activities: [{ name: 'Youtube', type: ActivityType.Watching }],
		});

		const filePath = path.join(__dirname, '..', 'data', 'youtube_channels.json');
		const jsonData = fs.readFileSync(filePath, 'utf-8');
		client.youtubeChannels = JSON.parse(jsonData);
		const guild = await client.guilds.fetch('961457745612124161');
		const alarmChannel = await guild.channels.fetch('1133945327360168088');

		const fetchYoutubeChannel = async (channelId) => {
			const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
			let videoIds = [];
			await axios.get(feedUrl)
				.then(response => {
					const xmlData = response.data;
					parseString(xmlData, (err, result) => {
						if (err) {
							console.error(err);
							return;
						}
						const videos = result['feed']['entry'];
						videos.forEach(video => {
							videoIds.push(video['yt:videoId'][0]);
						});
					});
				});
			return videoIds;
		}
		const checkYoutubeChannel = async (channelId) => {
			const videoIds = await fetchYoutubeChannel(channelId);
			videoIds.forEach((videoId) => {
				if (client.youtubeChannels[channelId]['video_ids'].findIndex((value) => value === videoId) === -1) {
					alarmChannel.send(`https://youtu.be/${videoId}`);
					client.youtubeChannels[channelId]['video_ids'].push(videoId);
				}
			});
		}

		setInterval(() => {
			let promises = [];
			for (const channelId in client.youtubeChannels) {
				promises.push(checkYoutubeChannel(channelId));
			}
			Promise.all(promises);
			fs.writeFileSync(filePath, JSON.stringify(client.youtubeChannels, null, 4));
		}, 10000);

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
