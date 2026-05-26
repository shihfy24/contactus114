// ✏️ 將下方網址替換為你的 Google Apps Script Web App URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbzrr5eIiC12n2KW_aD4PJOjxV_bLBgnw-n_061Y4CyfeLp7H1PngjbeZ0bn5ykPit8/exec";

// ---------- 表單驗證 ----------
function validateForm() {
  let valid = true;

  const fields = [
	{ id: "name",        errorId: "nameError",       check: v => v.trim() !== "" },
	{ id: "phone",       errorId: "phoneError",      check: v => /^[0-9\-\+\(\)\s]{7,20}$/.test(v.trim()) },
	{ id: "email",       errorId: "emailError",      check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
	{ id: "pickupTime",  errorId: "pickupTimeError", check: v => v !== "" },
  ];

  fields.forEach(({ id, errorId, check }) => {
	const input = document.getElementById(id);
	const error = document.getElementById(errorId);
	if (!check(input.value)) {
	  input.classList.add("error");
	  error.classList.add("visible");
	  valid = false;
	} else {
	  input.classList.remove("error");
	  error.classList.remove("visible");
	}
  });

  return valid;
}

// 即時清除錯誤狀態
["name","phone","email","pickupTime"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
	document.getElementById(id).classList.remove("error");
	document.getElementById(id + "Error").classList.remove("visible");
  });
});

// ---------- 送出表單 ----------
async function submitForm() {
  hideToasts();
  if (!validateForm()) return;

  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.classList.add("loading");
  btn.querySelector(".btn-text").textContent = "送出中…";

  const payload = {
	name:        document.getElementById("name").value.trim(),
	phone:       document.getElementById("phone").value.trim(),
	email:       document.getElementById("email").value.trim(),
	pickupTime:  document.getElementById("pickupTime").value,
	note:        document.getElementById("note").value.trim(),
  };

  try {
	const res = await fetch(GAS_URL, {
	  method: "POST",
	  // Google Apps Script 需使用 text/plain 避免 CORS preflight
	  headers: { "Content-Type": "text/plain;charset=utf-8" },
	  body: JSON.stringify(payload),
	});

	const json = await res.json();

	if (json.status === "success") {
	  document.getElementById("toastSuccess").classList.add("visible");
	  document.getElementById("contactForm").querySelectorAll("input, textarea").forEach(el => el.value = "");
	} else {
	  throw new Error(json.message || "未知錯誤");
	}
  } catch (err) {
	document.getElementById("toastErrorMsg").textContent =
	  "送出失敗：" + (err.message || "請稍後再試。");
	document.getElementById("toastError").classList.add("visible");
  } finally {
	btn.disabled = false;
	btn.classList.remove("loading");
	btn.querySelector(".btn-text").textContent = "送出表單";
  }
}

function hideToasts() {
  document.getElementById("toastSuccess").classList.remove("visible");
  document.getElementById("toastError").classList.remove("visible");
}