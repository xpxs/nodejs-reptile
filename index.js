let cheerio = require("cheerio"),
    fs = require("fs"),
    nodeExcel = require('excel-export'),
    util = require("util"),
    https = require('https'),
   	source_url = 'https://www.yidaiyilu.gov.cn',
    // url = 'https://www.yidaiyilu.gov.cn/info/iList.jsp?cat_id=10005&cur_page=1';
    url = 'https://www.yidaiyilu.gov.cn/';
// for (var i = 0; i <= 2; i++) {
	let  html = ""
    let  list = []
    let  buffer = null
    let  newslist = []
   	// let  _url = url + (i + 1)
	let req = https.request(url, function(res) {
	    res.on("data", function(data) {
            list.push(data)
        })
        res.on("end", async function() {
            buffer = Buffer.concat(list)
            html = buffer.toString()
	        $ = cheerio.load(html)
              // for(var i=1;i<=3;i++){
              //   let dlist = `.con_yw_${i}`;
              //   console.log('$(".mybox .main-1").find(dlist).find("a")', $(".mybox .main-1").find(dlist).find('a'))
              //   $(".mybox .main-1").find(dlist).find("a").each((index,ele)=>{
              //     let txt = $(ele).text();
              //     let alink = $(ele).attr("href")
              //     let news = {};
              //     news["title"] = txt;
              //     news["url"] = source_url + alink;
              //     newslist.push(news)
              //   })
              // }
              // await readycontentdata(newslist)
            console.log('$(".wtfz_list_right ul")', $(".wtfz_list_right ul").find("li"))
            $(".wtfz_list_right ul").find("li").find("a").each((index, ele) => {
            	console.log('index', index)
            	if (index === 0) {
	                let txt = $(ele).text();
	                let alink = $(ele).attr("href")
	                let news = {};
	                news["title"] = txt;
	                news["url"] = source_url + alink;
	                newslist.push(news)
                }
            })
           	if (3 === newslist.length ) {
	        	await readycontentdata(newslist)
			}
	    })
	})
	req.end()
// }
async function readycontentdata(data) {
	let arr = []
	for (var i = 0; i <= data.length; i++) {
		let _list = []
		let buf = null
		let _html = ''
		let obj = {}
		obj.create_content = ''
		let _req = https.request(data[i].url, function(res) {
		    res.on("data", function(_data) {
		        _list.push(_data)
		    })
		    res.on("end", async function() {
		        buf = Buffer.concat(_list)
		        _html = buf.toString()
		        $ = cheerio.load(_html)
		        obj.create_title = $("#zoom .main_content_title").text()
		        obj.create_date = $("#zoom div .szty .szty1").text()
		        obj.create_born = $("#zoom div .szty .szty2").text()
		        $("#zoom .info_content").find('p').each((index, ele)=>{
		        	obj.create_content += $(ele).text() + '^^^^^^'
		        })
		        obj.create_editor = $("#zoom .editor").text()
				arr.push(obj)
				if (arr.length === data.length ) {
					let r = await readydata(arr);
					await exportdata(r);
				}
		    })
		})
		_req.end()
	}
}
async function readydata(data) {
    //做点什么，如从数据库取数据
    let exceldata = data;
    return exceldata;
}
//导出
async function exportdata(v) {
    let conf = {};
    conf.name = "mysheet"; //表格名
    let alldata = new Array();
    for (let i = 0; i < v.length; i++) {
        let arr = new Array();
        arr.push(v[i].create_title);
        arr.push(v[i].create_date);
        arr.push(v[i].create_born);
        arr.push(v[i].create_content);
        arr.push(v[i].create_editor);
        alldata.push(arr);
    }
    //决定列名和类型
    conf.cols = [{
        caption: '标题',
        type: 'string'
    }, {
        caption: '日期',
        type: 'string'
    }, {
        caption: '来源',
        type: 'string'
    }, {
        caption: '内容',
        type: 'string'
    }, {
        caption: '编辑',
        type: 'string'
    }];
    conf.rows = alldata; //填充数据
    const date = new Date().getTime()
    let result = nodeExcel.execute(conf);
    let data = Buffer.from(result,'binary');
    fs.writeFile(`./upload-excel/${conf.name}-${date}.xlsx`, data, function(err, data) {
        if (err) {
            throw err;
        }
        console.log('------success------')
    })
}