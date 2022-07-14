const express = require('express')
const app = express()
const path = require('path')
const router = express.Router()
const fs = require('fs')
const archiver = require('archiver')

var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
app.use(bodyParser.urlencoded({extended: false}));


app.use(express.static(__dirname + '/public/style'));
router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/index.html'))
});
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, '/tmp'),
    createParentPath: true
}))
function archiveFolder(){

    const output = fs.createWriteStream('data/output/output.zip');
    const archive = archiver('zip');

    output.on('close', () => {
    console.log(archive.pointer() + ' total bytes');
    });
    archive.on('error', (err) =>{
    throw err;
    })


    archive.pipe(output);
    archive.directory('data/input/data/input/', false);
    archive.finalize();
    
}

app.post('/succes', async function (req, res) {
    var radioChecked = req.body.extension;
    var resize = req.body.resize;
    var quality = req.body.quality;
    var file = req.body.file;

    if(resize == undefined){
        console.log("");
    }else if(resize == "0"){
        console.log("");
    }else{
        console.log("Preset resize: ", resize);
    }

    try{
        const files = req.files.file
        const folderName = 'data/input/' + new Date().getTime().toString()

            if(!fs.existsSync(folderName)){
                fs.mkdirSync(folderName);
            }
            archiveFolder()
            const promises = files.map((file) => {
            const savePath = path.join(__dirname, 'data', 'input', folderName, file.name)
            return file.mv(savePath)
          })
          await Promise.all(promises)
        } catch(error){
        console.log(error);
        res.send("Errors ask the admin");
    }
    res.redirect('/download');
});

app.use(express.static(__dirname + '/public'));
router.get('/download', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/loading.html'))
});

app.use('/', router)
app.listen(3000)
console.log('Server running on port 3000')

