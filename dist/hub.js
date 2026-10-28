(() => {
  const time = new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Bangkok', hour:'2-digit', minute:'2-digit', hour12:false });
  const date = new Intl.DateTimeFormat('th-TH', { timeZone:'Asia/Bangkok', weekday:'long', day:'numeric', month:'long', year:'numeric' });
  function tick() {
    const now = new Date();
    document.getElementById('hub-time').textContent = time.format(now);
    document.getElementById('hub-date').textContent = date.format(now);
  }
  tick();
  setInterval(tick, 1000);
})();
