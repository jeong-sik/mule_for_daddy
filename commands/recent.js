const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require('iconv-lite');

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("신제품")
    .setDescription("뮬 첫페이지 확인")
		.addStringOption(option =>
			option.setName('qs')
				.setDescription('검색어'))
		.addBooleanOption(option => 
			option.setName(`ec`).setDescription('판매 완료 표시 안함')),
  async execute(interaction) {
		const qs = interaction.options.getString('qs');
		const ec = interaction.options.getBoolean('ec');
		let result;
		if(qs) {
			result = await axios.get(`https://www.mule.co.kr/bbs/market/sell?qf=title&qs=${qs}&period=12&of=wdate&od=desc&v=l`);
			
		} else {
			result = await axios.get("https://www.mule.co.kr/bbs/market/sell?period=12&of=wdate&od=desc&v=l");
		} 
		// const content = iconv.decode(result.data, 'UTF-8');
    const $ = cheerio.load(result.data);
		
		// Array(...document.querySelectorAll("table > tbody > tr > td")).filter(item => item.className === "title").map(item => item.innerText)
		const array = []
    const items = $("table > tbody > tr:not(.premium) > td a:nth-child(1)").map((i, element) => {
			 array.push($(element).text().trim().replace(/\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s\s*/g, ' ').replace(/\r\n/g, ''))
		})
		// items
    const filtered = array.filter((item, index) => item.includes("|")).filter(x => {
			if(ec) {
				return !x.includes("판매완료")
			} else {
				return true
			}
		})
	  const final = filtered.splice(5, filtered.length + 5).reduce((prev, next) => 
		{ return `${prev}
${next.split("|")[0]}
` 
		}
		,"")
		if(final.length > 100) {
			await interaction.reply(final);
		}
    
  },
};
