import { XMLParser } from "fast-xml-parser";

async function pegarNoticias(): Promise<void> {
    const url = "https://news.google.com/rss/search?q=Concurso%20do%20Banco%20do%20Brasil&hl=pt-BR&gl=BR&ceid=BR%3Apt-419";

    try {
        const response = await fetch(url);
        const xml = await response.text();

        const parser = new XMLParser();
        const documento = parser.parse(xml);

        const itens = documento.rss.channel.item;

        const noticias = (Array.isArray(itens) ? itens : [itens]).map((item: any) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate
        }));
        
        const dataHoje = new Date()

        const noticiasFiltradas = noticias.filter(noticia => {
            const dataNoticia = new Date(noticia.pubDate);
            const hojeOuOntem: boolean =
                dataHoje.getDate() === dataNoticia.getDate() ||
                (dataHoje.getDate() === 1 && dataNoticia.getDate() === 31) ||
                dataHoje.getDate() - 1 === dataNoticia.getDate()

            const ontemApos18h: boolean = 
                hojeOuOntem &&
                (dataNoticia.getHours() > 18 ||
                dataNoticia.getMinutes() > 0)

            if(hojeOuOntem || ontemApos18h){
                return noticia
            }

        });

    if (noticiasFiltradas.length === 0){
        fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${process.env.CHAT_ID}&text=Não há notícias para hoje. Bons estudos`)
    }
    const mensagem = noticiasFiltradas
    .map(noticia => `${noticia.title}\n${noticia.link}`)
    .join("\n\n");

    const mandarMensagem = await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${encodeURIComponent(mensagem)}`
    );
    } catch (error) {
        console.error(error);
    }

}

pegarNoticias()