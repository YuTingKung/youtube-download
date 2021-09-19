require("dotenv").config()

// install express with `npm install express`
const express = require('express')
const app = express()
var { customAlphabet } = require("nanoid");
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)
const fs = require('fs');
const ytdl = require('ytdl-core');

app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.urlencoded({ extended:false }))
app.use(express.json()) // for parsing application/json bodies

const { Deta } = require("deta")

// add your Project Key
const deta = Deta(process.env.PROJECT_KEY)
// name your DB
// const db = deta.Base("urls")

app.get('/', async (req, res) => {
    // const shortUrls = await db.fetch({});
    res.render('index', { shortUrls: [] })
})

app.post('/shortUrls', async (req, res) => {
    try {
        const now = new Date().getTime();
        const dir = './public/mp3/';
        fs.readdir(dir, (err, files) => {
            files.forEach(file => {
              const time = file.split('-')[0];
              if(now - time > 36*1000) {
                fs.unlinkSync(`${dir}${file}`);
              }
            });
        });

        const id = nanoid();
        const url = req.body.fullUrl.split('watch?v=')[1].substring(0, 11);
        const fullUrl = `https://www.youtube.com/watch?v=${url}`;
        const info = await ytdl.getInfo(fullUrl);
        const title = info.videoDetails.title;
        const thumbnails =info.videoDetails.thumbnails;
        const path = `/mp3/${now}-${id}.mp3`;
        ytdl(fullUrl, { filter: 'audioonly' }).pipe(fs.createWriteStream(`public${path}`));
        item = { 
            fullUrl : fullUrl,
            full: title,
            short: url,
            name: `${title}.mp3`,
            path: path,
            thumbnail: thumbnails[thumbnails.length - 1].url
        };
        items = [ item ];
        res.render('table', { shortUrls: items })
    } catch (e) {
        return res.sendStatus(404);
    }
})

// export 'app'
// module.exports = app
app.listen(3000)