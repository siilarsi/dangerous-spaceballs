(function(){
  function getHighscore(){
    return parseInt(localStorage.getItem('highscore') || '0');
  }
  function setHighscore(v){
    localStorage.setItem('highscore', v);
  }
  function getCredits(){
    return parseInt(localStorage.getItem('credits') || '0');
  }
  function setCredits(v){
    localStorage.setItem('credits', v);
  }
  function getPermanentUpgrades(){
    return JSON.parse(localStorage.getItem('permanentUpgrades') || '[]');
  }
  function setPermanentUpgrades(arr){
    localStorage.setItem('permanentUpgrades', JSON.stringify(arr));
  }
  function getSessionUpgrades(){
    return JSON.parse(sessionStorage.getItem('sessionUpgrades') || '[]');
  }
  function setSessionUpgrades(arr){
    sessionStorage.setItem('sessionUpgrades', JSON.stringify(arr));
  }
  function resetAll(){
    localStorage.removeItem('highscore');
    localStorage.removeItem('credits');
    localStorage.removeItem('permanentUpgrades');
    sessionStorage.removeItem('sessionUpgrades');
  }
  window.storage = {
    getHighscore,
    setHighscore,
    getCredits,
    setCredits,
    getPermanentUpgrades,
    setPermanentUpgrades,
    getSessionUpgrades,
    setSessionUpgrades,
    resetAll
  };
})();
