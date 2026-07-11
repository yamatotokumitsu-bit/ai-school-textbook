// ページ全体をAES-256-GCMで暗号化し、合言葉ゲート付きHTMLを生成する
// 使い方: node build_secure_page.js <合言葉> <元HTML> <出力HTML>
// taiken-analytics/build_secure.js（データ暗号化版）の全文暗号化バリエーション
const fs=require('fs'),crypto=require('crypto');
const pass=process.argv[2], src=process.argv[3], out=process.argv[4];
if(!pass||!src||!out){console.error("usage: node build_secure_page.js <pass> <src> <out>");process.exit(1);}
const html=fs.readFileSync(src,'utf8');
// 暗号化 AES-256-GCM + PBKDF2
const salt=crypto.randomBytes(16), iv=crypto.randomBytes(12);
const key=crypto.pbkdf2Sync(pass,salt,100000,32,'sha256');
const c=crypto.createCipheriv('aes-256-gcm',key,iv);
const enc=Buffer.concat([c.update(html,'utf8'),c.final()]);
const tag=c.getAuthTag();
const CIPHER={s:salt.toString('base64'),i:iv.toString('base64'),d:Buffer.concat([enc,tag]).toString('base64')};
const page=`<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Claudeコード超完全版（受講生限定）</title></head>
<body style="margin:0">
<div id="__gate" style="position:fixed;inset:0;z-index:9999;background:#f9f8f4;color:#191713;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,'Hiragino Sans',sans-serif">
 <form id="__gform" style="background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:30px 34px;max-width:400px;width:90%;box-shadow:0 10px 40px rgba(0,0,0,.15)">
  <div style="font-size:12px;letter-spacing:.16em;color:#8a6d1f;font-weight:700">AI実践スクール｜TOKYO YAMAGAWA DMC</div>
  <h1 style="font-size:20px;margin:6px 0 4px;font-family:'Hiragino Mincho ProN',serif">Claudeコード超完全版</h1>
  <p style="font-size:12.5px;color:#666;margin:0 0 16px;line-height:1.7">受講生限定の教科書です。講座でお伝えしている合言葉を入力してください。</p>
  <input id="__pw" type="password" placeholder="合言葉" autocomplete="off" autofocus style="width:100%;padding:11px 13px;font-size:15px;border:1px solid #ccc;border-radius:8px;box-sizing:border-box">
  <button type="submit" style="width:100%;margin-top:12px;padding:11px;font-size:14px;font-weight:700;border:none;border-radius:8px;background:#233d33;color:#fff;cursor:pointer">ひらく</button>
  <p id="__err" style="display:none;font-size:12px;color:#b91c1c;margin:10px 0 0">合言葉がちがうようです。もう一度お試しください。</p>
 </form>
</div>
<script>
const CIPHER=${JSON.stringify(CIPHER)};
function __b64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
async function __unlock(pw){
 const enc=new TextEncoder();
 const km=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:__b64(CIPHER.s),iterations:100000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:__b64(CIPHER.i)},key,__b64(CIPHER.d));
 return new TextDecoder().decode(plain);
}
document.getElementById('__gform').addEventListener('submit',async e=>{
 e.preventDefault();
 const btn=e.target.querySelector('button');btn.textContent='ひらいています…';
 try{ const html=await __unlock(document.getElementById('__pw').value.trim());
  document.open();document.write(html);document.close();
 }catch(_){ document.getElementById('__err').style.display='block';
  btn.textContent='ひらく';
  document.getElementById('__pw').value='';document.getElementById('__pw').focus(); }
});
</script></body></html>`;
fs.writeFileSync(out,page);
console.log("OK built:",out,"| gate",page.length,"bytes | encrypted",html.length,"chars");
