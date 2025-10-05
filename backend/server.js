const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000; // استخدام بورت البيئة
const DB_PATH = path.join(__dirname, "db.json");
const UPLOADS = path.join(__dirname, "uploads");

// ======== إعدادات السيرفر ========
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS));
app.use(express.static(path.join(__dirname, "frontend"))); // ملفات frontend داخل نفس المجلد

// ======== التأكد من وجود db.json و uploads ========
function initDB() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ products: [], offers: [] }, null, 2));
  if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS);
}
initDB();

// ======== رفع الصور ========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ======== دوال مساعدة ========
function readDB() { return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")); }
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

// ======== API للزبائن ========
app.get("/api/products", (req,res)=> res.json(readDB().products));
app.get("/api/offers", (req,res)=> res.json(readDB().offers));

// ======== Admin login ========
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "12345"; // يمكن تغييره من Environment Variables
app.post("/api/admin/login", (req,res)=>{
  const { password } = req.body;
  if(password === ADMIN_PASSWORD) res.json({ ok:true, token:"ADMIN_TOKEN" });
  else res.json({ ok:false, msg:"كلمة مرور خاطئة" });
});

// ======== Middleware للتحقق من التوكن ========
function auth(req,res,next){
  const token = req.headers.authorization?.split(" ")[1];
  if(token === "ADMIN_TOKEN") next();
  else res.status(401).json({ ok:false, msg:"Unauthorized" });
}

// ======== CRUD للمنتجات ========
app.get("/api/admin/products", auth, (req,res)=> res.json(readDB().products));

app.post("/api/admin/products", auth, upload.single("img"), (req,res)=>{
  const db = readDB();
  const { name, price, category, barcode } = req.body;
  const product = { 
    id: Date.now(), 
    name, 
    price: parseFloat(price)||0, 
    category, 
    barcode, 
    img: req.file ? `/uploads/${req.file.filename}` : (req.body.img || null)
  };
  db.products.push(product);
  writeDB(db);
  res.json({ ok:true, product });
});

app.put("/api/admin/products/:id", auth, upload.single("img"), (req,res)=>{
  const db = readDB();
  const id = parseInt(req.params.id);
  const p = db.products.find(x=>x.id===id);
  if(!p) return res.json({ ok:false });
  const { name, price, category, barcode } = req.body;
  if(name) p.name=name; if(price) p.price=parseFloat(price);
  if(category) p.category=category; if(barcode) p.barcode=barcode;
  if(req.file) p.img=`/uploads/${req.file.filename}`;
  writeDB(db);
  res.json({ ok:true });
});

app.delete("/api/admin/products/:id", auth, (req,res)=>{
  const db = readDB();
  const id = parseInt(req.params.id);
  db.products = db.products.filter(p=>p.id!==id);
  writeDB(db);
  res.json({ ok:true });
});

// ======== CRUD للعروض ========
app.get("/api/admin/offers", auth, (req,res)=> res.json(readDB().offers));

app.post("/api/admin/offers", auth, upload.single("img"), (req,res)=>{
  const db = readDB();
  const { title, desc } = req.body;
  const offer = { id: Date.now(), title, desc, img: req.file ? `/uploads/${req.file.filename}` : null };
  db.offers.push(offer);
  writeDB(db);
  res.json({ ok:true });
});

app.put("/api/admin/offers/:id", auth, upload.single("img"), (req,res)=>{
  const db = readDB();
  const id = parseInt(req.params.id);
  const o = db.offers.find(x=>x.id===id);
  if(!o) return res.json({ ok:false });
  const { title, desc } = req.body;
  if(title) o.title = title; if(desc) o.desc = desc;
  if(req.file) o.img = `/uploads/${req.file.filename}`;
  writeDB(db);
  res.json({ ok:true });
});

app.delete("/api/admin/offers/:id", auth, (req,res)=>{
  const db = readDB();
  const id = parseInt(req.params.id);
  db.offers = db.offers.filter(o=>o.id!==id);
  writeDB(db);
  res.json({ ok:true });
});

// ======== تشغيل السيرفر ========
app.listen(PORT, ()=> console.log(`✅ Server running at http://localhost:${PORT}`));
