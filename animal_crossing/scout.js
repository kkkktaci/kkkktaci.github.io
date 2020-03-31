const axios = require('axios')
const cherrio = require('cheerio')
const fs = require('fs')

var client = axios.create({
    baseURL: 'https://wiki.biligame.com/dongsen'
})

getCatchableList(client, '/博物馆图鉴', 'fish.html')
getCatchableList(client, '/虫图鉴', 'insect.html')
getAnimalList(client, '/小动物图鉴', 'animal.html')

async function getCatchableList(client, url, filename) {
    console.log(`>>> Step 1: 准备请求wiki页面 ${url}`)
    const result = await client.get(encodeURI(url))

    console.log(`>>> Step 2: 请求 ${url} 成功，准备解析html`)
    const $ = cherrio.load(result.data)
    var fishList = $('table[id=CardSelectTr]').find('tbody').children()

    var data = new Array();
    if (fishList.length > 1) {
        var pending
        fishList.each(function (index, element) {
            if (index > 0) {
                pending = cherrio.load(element)
                var image
                try {
                    image = pending('img[class=img-kk]').attr('src')

                } catch (error) {
                    image = ''
                }
                var name = pending('a').attr()['title'].trim()
                var place = element.attribs['data-param1'].trim()
                // 鱼影或者昆虫出现天气
                var extra = element.attribs['data-param2'].trim()
                var north = element.attribs['data-param3'].split(', ')
                var south = element.attribs['data-param4'].split(', ')
                var time = element.attribs['data-param5'].split(', ')
                var price = pending('td').last().text()

                data.push({ image, name, place, extra, north, south, time, price })
            }
        })
    }
    
    console.log(`>>> Step 3: 解析完成，准备写入${filename}`)
    fs.writeFile(`./animal_crossing/${filename}`, JSON.stringify(data), function (error) {
        if (error) {
            console.log(`>>> 写入失败, ${error}`)
        } else {
            console.log(`写入${filename}成功！`)
        }
    })
}

async function getAnimalList(client, url, filename) {
    console.log(`>>> Step 1: 准备请求小动物wiki页面 ${url}`)
    const result = await client.get(encodeURI(url))

    console.log(`>>> Step 2: 请求 ${url} 成功，准备解析html`)
    const $ = cherrio.load(result.data)
    var fishList = $('table[id=CardSelectTr]').find('tbody').children()

    var data = new Array();
    if (fishList.length > 1) {
        var pending
        fishList.each(function (index, element) {
            if (index > 0) {
                pending = cherrio.load(element)
                var image
                try {
                    image = pending('img[class=img-kk]').attr('src')

                } catch (error) {
                    image = ''
                }
                var name = pending('a').attr()['title'].trim()
                // 性别
                var sex = element.attribs['data-param1']
                // 种族
                var race = element.attribs['data-param2']
                // 性格
                var nature = element.attribs['data-param3']
                // 生日
                var birthday = pending('td').eq(-2).text()
                // 口头禅
                var byword = pending('td').last().text()

                data.push({ image, name, sex, race, nature, birthday, byword })
            }
        })
    }

    console.log(`>>> Step 3: 解析完成，准备写入${filename}`)
    fs.writeFile(`./animal_crossing/${filename}`, JSON.stringify(data), function (error) {
        if (error) {
            console.log(`>>> 写入失败, ${error}`)
        } else {
            console.log(`写入${filename}成功！`)
        }
    })
}
