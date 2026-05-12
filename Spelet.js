const KOLUMNER = 28;
const RADER    = 21;
const CELL     = 20;

const FÄRGER = {
  p1_kropp: '#1dff6e',
  p1_huvud: '#0f6e35',
  p2_kropp: '#37d4ff',
  p2_huvud: '#0a4a5a',
  mat:      '#ff4545',
  bonus:    '#ffb830',
  rutnät:   'rgba(255,255,255,0.03)',
};

const canvas  = document.getElementById('spelplan');
const ctx     = canvas.getContext('2d');
const overlay = document.getElementById('overlay');

let FörstaORMEN, AndraOrmen; 