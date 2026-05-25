let rainData = [];
let lastUpdated = "";
let mappa;
let myMap;
const padding = 30;

// 使用 corsproxy.io 代理伺服器
const apiUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://wic.gov.taipei/OpenData/API/Rain/Get?stationNo=&loginId=open_rain&dataKey=85452C1D');

// 地圖初始設定
const mapOptions = {
  lat: 25.0478,
  lng: 121.5319,
  zoom: 11,
  style: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
};

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
 
  // 初始化 Mappa
  mappa = new Mappa('Leaflet');
  myMap = mappa.tileMap(mapOptions);
  myMap.overlay(canvas);

  // 初始讀取資料
  fetchRainData();
 
  // 設定每 5 分鐘自動更新一次 (300,000 毫秒)
  setInterval(fetchRainData, 300000);
 
  textFont('sans-serif');
}




function fetchRainData() {
  // 使用 p5.js 的 loadJSON 取得資料
  loadJSON(apiUrl, (data) => {
    console.log("資料回傳成功:", data);
   
    // 彈性檢查：有些 API 回傳直接是陣列，有些會包在 Data 屬性裡
    let actualData = Array.isArray(data) ? data : (data.Data || data.data || []);
   
    if (actualData.length > 0) {
      rainData = actualData;
      lastUpdated = new Date().toLocaleTimeString();
    }
  }, (err) => {
    console.error("無法取得 API 資料，請檢查網路連線或 CORS 限制:", err);
  });
}

function draw() {
  // 清除 p5 畫布，讓底層的地圖顯現出來
  clear();
 
  // 繪製右上角狀態資訊
  drawStatusUI();

  if (rainData.length > 0) {
    fill(0); // 字體設為黑色
    stroke(255); // 文字描白邊增加地圖上的辨識度
    strokeWeight(2);
    textAlign(CENTER, CENTER);

    for (let item of rainData) {
      // 從 API 取得經緯度 (欄位可能是 lat/lon 或 Latitude/Longitude)
      let lat = item.lat || item.Latitude;
      let lon = item.lon || item.Longitude;
      
      if (lat && lon) {
        let pos = myMap.latLngToPixel(lat, lon);
        
        // 只繪製在畫面內的點
        if (pos.x > 0 && pos.x < width && pos.y > 0 && pos.y < height) {
          let sName = item.StationName || item.stationName || "未知";
          let rain = item.Rain1hr || item.rain || 0;
          
          // 繪製測站標點
          fill(0);
          ellipse(pos.x, pos.y, 8, 8);
          
          // 繪製站名與雨量文字 (黑色)
          fill(0);
          textSize(12);
          text(`${sName}\n${rain}mm`, pos.x, pos.y - 20);
        }
      }
    }
  }
}

function drawStatusUI() {
  push();
  fill(255, 200);
  noStroke();
  rect(10, 10, 260, 65, 5);
  
  fill(0);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(28);
  text("台北市即時雨量", 30, 15);
 
  textStyle(NORMAL);
  textSize(12);
  text(`最後更新: ${lastUpdated || 'Loading...'}`, 30, 48);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
