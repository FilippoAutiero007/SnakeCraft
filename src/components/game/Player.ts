export interface PlayerSegment {
  x: number;
  y: number;
}

export class Player {
  segments: PlayerSegment[] = [];
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  speed: number = 2;
  size: number = 10;
  color: string = "#00ff00";
  maxLength: number = 3;
  growing: number = 0; // Numero di segmenti da aggiungere

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    // Inizializza il giocatore con 3 segmenti
    for (let i = 0; i < this.maxLength; i++) {
      this.segments.push({ x: x - i * this.size, y });
    }
  }

  setDirection(vx: number, vy: number): void {
    // Evita che il giocatore si muova all'indietro
    if (this.vx === -vx && this.vy === -vy) return;

    this.vx = vx * this.speed;
    this.vy = vy * this.speed;
  }

  update(canvasWidth: number, canvasHeight: number): void {
    // Muovi la testa
    this.x += this.vx;
    this.y += this.vy;

    // Rimbalzo ai bordi
    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;

    // Aggiungi nuovo segmento in testa
    this.segments.unshift({ x: this.x, y: this.y });

    // Rimuovi l'ultimo segmento se non in crescita
    if (this.growing > 0) {
      this.growing--;
    } else if (this.segments.length > this.maxLength) {
      this.segments.pop();
    }
  }

  grow(amount: number = 1): void {
    this.growing += amount;
    this.maxLength += amount;
  }

  getHeadPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getLength(): number {
    return this.segments.length;
  }

  checkCollisionWithSelf(): boolean {
    const head = this.segments[0];
    if (!head) return false;

    // Controlla collisione con il corpo (escludendo i primi 4 segmenti)
    for (let i = 4; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const dx = head.x - segment.x;
      const dy = head.y - segment.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size) {
        return true;
      }
    }

    return false;
  }

  checkCollisionWithPoint(x: number, y: number, radius: number = 10): boolean {
    const head = this.segments[0];
    if (!head) return false;

    const dx = head.x - x;
    const dy = head.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < this.size + radius;
  }

  setColor(color: string): void {
    this.color = color;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Disegna corpo
    ctx.fillStyle = this.color;
    this.segments.forEach((segment, index) => {
      // Sfuma il colore verso il retro
      const alpha = 1 - (index / this.segments.length) * 0.5;
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(segment.x, segment.y, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    // Disegna occhi sulla testa
    const head = this.segments[0];
    if (head) {
      ctx.fillStyle = "#ffffff";
      const eyeSize = 3;
      const eyeDistance = 3;

      // Calcola direzione dello sguardo
      let eyeOffsetX = 0;
      let eyeOffsetY = 0;

      if (this.vx !== 0 || this.vy !== 0) {
        const angle = Math.atan2(this.vy, this.vx);
        eyeOffsetX = Math.cos(angle) * eyeDistance;
        eyeOffsetY = Math.sin(angle) * eyeDistance;
      }

      // Occhio sinistro
      ctx.beginPath();
      ctx.arc(
        head.x + eyeOffsetX - 2,
        head.y + eyeOffsetY - 2,
        eyeSize,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Occhio destro
      ctx.beginPath();
      ctx.arc(
        head.x + eyeOffsetX + 2,
        head.y + eyeOffsetY + 2,
        eyeSize,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.segments = [];
    this.maxLength = 3;
    this.growing = 0;

    for (let i = 0; i < this.maxLength; i++) {
      this.segments.push({ x: x - i * this.size, y });
    }
  }
}
