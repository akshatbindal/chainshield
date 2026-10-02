import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {data} from './data.mjs';
import {plan} from './planner.mjs';
const root=new URL('./public/',import.meta.url);
const files=new Map([['/','index.html'],['/app.js','app.js'],['/style.css','style.css']]);
const mime={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
const json=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    if(req.method==='GET'&&url.pathname==='/api/data')return json(res,200,data);
    if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,mode:'local-synthetic',snowflakeConnected:false,aiConnected:false});
    if(req.method==='POST'&&url.pathname==='/api/plan'){
      let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)return json(res,413,{error:'Request too large'});}
      let result;try{result=plan(JSON.parse(body||'{}'));}catch(e){return json(res,400,{error:e.message});}
      return json(res,200,result);
    }
    if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
    const file=files.get(url.pathname);if(!file)return json(res,404,{error:'Not found'});
    const content=await readFile(fileURLToPath(new URL(file,root)));
    res.writeHead(200,{'Content-Type':mime[file.split('.').pop()],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"});res.end(content);
  }catch{json(res,500,{error:'Local server error'});}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('ChainShield: http://127.0.0.1:'+(process.env.PORT||4173)+' (synthetic local prototype; Snowflake/AI not connected)'));
