const sections = document.querySelectorAll("section");
const lastSection = document.getElementById("intro3");
const enterBtn = document.getElementById("enterBtn");

function checkScroll() {
  // 計算一個觸發點，設為視窗高度的 4/5（也就是螢幕底部往上 80% 的位置）
  const triggerBottom = (window.innerHeight / 5) * 4;

  // 對每個 section 區塊做檢查
  sections.forEach((section) => {
    // 取得該區塊距離視窗頂端的距離（包含滾動後的相對位置）
    const sectionTop = section.getBoundingClientRect().top;

    // 如果該區塊的頂部位置小於 triggerBottom（表示區塊已經快要進入螢幕視野）
    if (sectionTop < triggerBottom) {
      // 加上 active 類別，觸發動畫或變更樣式
      section.classList.add("active");
    } else {
      // 否則移除 active 類別，動畫可重置或回復初始狀態
      section.classList.remove("active");
    }
  });

  // 判斷最後一頁是否顯示，決定按鈕顯示與否
  if (lastSection.classList.contains("active")) {
    enterBtn.style.display = "inline-block";
  } else {
    enterBtn.style.display = "none";
  }
}

window.addEventListener("scroll", checkScroll);
window.addEventListener("load", checkScroll);

// 按鈕點擊事件：跳轉到主畫面 (請改成你想要的網址)
enterBtn.addEventListener("click", () => {
  window.location.href = "./order-system-frontend/index.html";
});
