/* Autherication 인증 Authoization 허가 */
/*
    REST API KEY  : 536defc4db4a57ef576edbeee77e0ca5
    redirect uri  : http://localhost:8000/auth/kakao/callback
    secret key    : 29PkcwbPFjdqfBzKc4KrR4UZh2ufTLa3
*/
const express = require('express');
const nunjucks = require('nunjucks');
const axios = require('axios');
const qs = require('qs');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended:false,}));
app.use(session({
    secret:'asdfasdfsdf',
    resave:false,
    secure:false,
    saveUninitialized:false,
}))

app.set('view engine','html');
nunjucks.configure('views',{
    express:app,
})

const kakao = {
    clientID: '536defc4db4a57ef576edbeee77e0ca5',
    clientSecret: '29PkcwbPFjdqfBzKc4KrR4UZh2ufTLa3',
    redirectUri: 'http://localhost:3000/auth/kakao/callback'
}

app.get('/',(req,res)=>{
    const {msg} = req.query;
    res.render('index',{
        msg,
        logininfo:req.session.authData,
    });
});


app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/login2',(req,res)=>{
    console.log(req.headers);
    //res.setHeader('Content-Type','application/x-www-form-urlencoded')
    //res.type('application/x-www-form-urlencoded');
    //res.send('ok');
    console.log(req.get('user-agent'));
    //req.set('content-type','application/x-www-form-urlencoded');

    //header 영역에서 status 값이 200대면 성공이구
    // 300~400은 에러입니다.
    res.status(200).json({text:'error'});
});

app.post('/login',(req,res)=>{    
    // npm install body-parser
    const {session,body} = req;
    const {userid,userpw} = body;

    // userid 과 userpw 값을가지고 DB조회
    // userid root userpw root 일때 성공하는 시나리오 작성
    if(userid == 'root' && userpw == 'root'){
        //로그인 성공
        const data = {
            userid,
        }

        session.authData = {
            ["local"]:data,
        }

        res.redirect('/?msg=로그인완료되었습니다.');
    } else {
        //로그인 실패
        res.redirect('/?msg=아이디와패스워드를 확인해주세요.');
    }
})

// profile account_email
app.get('/auth/kakao',(req,res)=>{
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`;
    res.redirect(kakaoAuthURL);
})

app.get('/auth/kakao/callback',async (req,res)=>{
    // axios => Promise Object
    const {session,query} = req; //req.session -> session
                                 //req.query -> query
    const {code} = query; // req.query.code -> code

    let token;
    try{
        token = await axios({
            method: 'POST',
            url: 'https://kauth.kakao.com/oauth/token',
            headers:{
                'content-type':'application/x-www-form-urlencoded'
            }, // npm install qs
            data:qs.stringify({
                grant_type:'authorization_code', // 특정 스트링 
                client_id:kakao.clientID,
                client_secret:kakao.clientSecret,
                redirectUri:kakao.redirectUri,
                //code:req.query.code,
                code,
            }) // 객체를 String으로 변환.
        })
    } catch(err){
        res.json(err.data)
    }


    let user;
    try{
        user = await axios({
            method:'GET',
            url:'https://kapi.kakao.com/v2/user/me',
            headers:{
                Authorization: `Bearer ${token.data.access_token}`
            }
        })
    } catch (err) {
        res.json(err.data)
    }

    

    //req.session.kakao = user.data;

    const authData = {
        ...token.data, // 깊은복사
        ...user.data, // 깊은복사 
    }

    session.authData = {
        ["kakao"]:authData,
    }

    
    
    res.redirect('/');
});

const authMiddleware = (req,res,next) => {
    const {session} = req;
    if(session.authData == undefined){
        console.log('로그인이 되어있지않음.')
        res.redirect('/?msg=로그인 안되어있음.')
    } else {
        console.log('로그인 되어있음.');
        next();
    }
}

app.get('/auth/info',authMiddleware,(req,res)=>{

    const {authData} = req.session;
    const provider = Object.keys(authData)[0];

    let userinfo = {}
    switch(provider){ // 값이 나오는 변수
        case "kakao":
           userinfo = {
               userid:authData[provider].properties.nickname,
           }
        break;
        case "local":
            userinfo = {
                userid:authData[provider].userid,
            }
        break;
    }
    res.render('info',{
        userinfo,
    })
})

app.get('/auth/kakao/unlink',authMiddleware, async (req,res)=>{
    const {session} = req;
    const {access_token} = session.authData.kakao
    
    
    
    let unlink;
    try{
        unlink = await axios({
            method:"POST",
            url:"https://kapi.kakao.com/v1/user/unlink",
            headers: { 
                Authorization: ` Bearer ${access_token}`
            }
        })
    } catch (error){
        res.json(error.data);
    }
    
    
    // 세션을 지워줘야합니다.
    const {id} = unlink.data;

    if(session.authData["kakao"].id == id){
        delete session.authData;
    }

    res.redirect('/?msg=로그아웃되셨습니다.')
})

app.get('/auth/logout',(req,res)=>{
    const {session} = req
    const {authData} = session;
    const provider = Object.keys(authData)[0];
    switch(provider){
        case "local":
            //로그아웃을 어떻게
            delete session.authData;
            res.redirect('/?msg=로그아웃되셨습니다.')
        break;
        case "kakao":
            //카카오일때 로그아웃을 이렇게.
            res.redirect('/auth/kakao/unlink')
        break;
    }
})

app.listen(3000,()=>{
    console.log(`server start port 3000`);
})