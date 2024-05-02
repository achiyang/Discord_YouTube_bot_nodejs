const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('종료')
		.setDescription('봇을 종료합니다'),
	async execute(interaction) {
		const memberId = interaction.member.id;
		if (['508138071984832513', '1021753759015116820'].includes(memberId)) {
			await interaction.reply({ content: '봇을 종료합니다', ephemeral: true }).then(() => {
				interaction.client.destroy().then(() => {
					process.exit();
				});
			});
		}
		else {
			await interaction.reply({ content: '아치양만 사용할 수 있지롱', ephemeral: true });
		}
	},
};
