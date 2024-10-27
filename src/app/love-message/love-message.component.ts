import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

interface Raindrop {
  id: number;
  left: string;
  delay: string;
  size: number;
}

@Component({
  selector: 'app-love-message',
  template: `
    <div class="scene-container" [class.night-mode]="isNightMode">
      <div class="ambient-controls">
        <button (click)="toggleRain()" class="control-btn">
          {{ isRaining ? '🌧️' : '☁️' }}
        </button>
        <button (click)="toggleTime()" class="control-btn">
          {{ isNightMode ? '🌙' : '☀️' }}
        </button>
      </div>

      <div class="scene" (click)="showNextMessage()">
        <!-- Cielo con nubes -->
        <div class="sky">
          <div class="cloud cloud1"></div>
          <div class="cloud cloud2"></div>
          <div class="cloud cloud3"></div>
        </div>

        <!-- Lluvia mejorada -->
        <div class="rain-container" *ngIf="isRaining">
          <div
            *ngFor="let drop of raindrops"
            class="raindrop"
            [style.left]="drop.left"
            [style.animation-delay]="drop.delay"
            [style.width.px]="drop.size"
            [style.height.px]="drop.size * 10"
          ></div>
        </div>

        <!-- Sol/Luna mejorados -->
        <div class="celestial-wrapper">
          <div
            class="celestial"
            [class.sun]="!isNightMode"
            [class.moon]="isNightMode"
          >
            <div class="glow"></div>
            <div class="crater crater1" *ngIf="isNightMode"></div>
            <div class="crater crater2" *ngIf="isNightMode"></div>
            <div class="crater crater3" *ngIf="isNightMode"></div>
          </div>
        </div>

        <!-- Mar mejorado -->
        <div class="ocean">
          <div class="wave wave1"></div>
          <div class="wave wave2"></div>
          <div class="wave wave3"></div>
          <div class="wave wave4"></div>
          <div class="reflection"></div>
        </div>

        <div class="message-container" [@messageAnimation]="messageState">
          <div class="message-content">
            <p class="message">{{ currentMessage.text }}</p>
            <div class="paper-effect"></div>
          </div>
        </div>
      </div>

      <div class="tap-hint" [class.hidden]="messageShown">
        Toca en cualquier lugar para ver el mensaje...
      </div>
    </div>
  `,
  styles: [
    `
      .scene-container {
        height: 100vh;
        width: 100%;
        position: relative;
        overflow: hidden;
        /* Nuevo gradiente para el atardecer */
        background: linear-gradient(
          180deg,
          #ff7e5f 0%,
          #feb47b 25%,
          #ffb88c 50%,
          #ffd8b1 75%,
          #e8f4f8 100%
        );
        transition: all 1.5s ease;
      }

      .scene-container.night-mode {
        background: linear-gradient(
          180deg,
          #0a1128 0%,
          #1a237e 60%,
          #283593 100%
        );
      }

      .sky {
        position: absolute;
        width: 100%;
        height: 70%;
        overflow: hidden;
      }

      .cloud {
        position: absolute;
        background: linear-gradient(
          to bottom,
          rgba(255, 182, 193, 0.8) 0%,
          rgba(255, 218, 185, 0.6) 100%
        );
        border-radius: 50px;
        filter: blur(5px);
        animation: float 20s infinite linear;
      }

      .cloud:before,
      .cloud:after {
        content: '';
        position: absolute;
        background: inherit;
        border-radius: 50%;
      }

      .cloud1 {
        width: 100px;
        height: 40px;
        top: 20%;
        left: -100px;
      }

      .cloud1:before {
        width: 50px;
        height: 50px;
        top: -20px;
        left: 15px;
      }

      .cloud1:after {
        width: 40px;
        height: 40px;
        top: -15px;
        left: 45px;
      }

      .cloud2 {
        width: 120px;
        height: 45px;
        top: 40%;
        left: -120px;
        animation-delay: -5s;
      }

      .cloud3 {
        width: 80px;
        height: 35px;
        top: 30%;
        left: -80px;
        animation-delay: -10s;
      }

      .celestial-wrapper {
        position: absolute;
        right: 15%;
        top: 15%;
        transform-style: preserve-3d;
        animation: float 6s infinite ease-in-out;
      }

      .celestial {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        position: relative;
        transition: all 1s ease;
        transform-style: preserve-3d;
      }

      .sun {
        background: radial-gradient(circle at 30% 30%, #ff8c69, #ff6b6b);
        box-shadow: 0 0 60px rgba(255, 107, 107, 0.4),
          0 0 120px rgba(255, 140, 105, 0.2);
        transform-origin: center;
        animation: sunPulse 4s infinite ease-in-out;
      }

      .sun .glow {
        background: radial-gradient(
          circle at center,
          rgba(255, 140, 105, 0.2),
          transparent 70%
        );
        animation: sunGlow 4s infinite ease-in-out;
      }

      .moon {
        background: radial-gradient(circle at 30% 30%, #ffffff, #f4f4f4);
        box-shadow: 0 0 40px rgba(255, 255, 255, 0.5);
      }

      .crater {
        position: absolute;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
      }

      .crater1 {
        width: 20px;
        height: 20px;
        top: 20px;
        left: 25px;
      }

      .crater2 {
        width: 15px;
        height: 15px;
        top: 45px;
        left: 15px;
      }

      .crater3 {
        width: 10px;
        height: 10px;
        top: 30px;
        left: 45px;
      }

      .ocean {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 30%;
        background: linear-gradient(
          180deg,
          rgba(30, 144, 255, 0.8) 0%,
          rgba(0, 102, 204, 0.9) 100%
        );
      }

      .wave {
        position: absolute;
        width: 200%;
        height: 40px;
        animation: wave 7s infinite linear;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.2),
          rgba(255, 255, 255, 0.1)
        );
        transform-style: preserve-3d;
      }

      .wave1 {
        top: -20px;
      }
      .wave2 {
        top: -15px;
        animation-delay: -2s;
      }
      .wave3 {
        top: -10px;
        animation-delay: -4s;
      }
      .wave4 {
        top: -5px;
        animation-delay: -6s;
      }

      .reflection {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          180deg,
          rgba(255, 126, 95, 0.2) 0%,
          rgba(254, 180, 123, 0.1) 30%,
          rgba(255, 184, 140, 0.05) 60%,
          transparent 100%
        );
        transform: rotateX(180deg);
        opacity: 0.6;
      }

      .raindrop {
        position: absolute;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.3),
          rgba(255, 255, 255, 0.1)
        );
        transform: rotate(15deg);
        animation: rain 1.5s linear infinite;
        filter: blur(0.5px);
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes sunPulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes sunGlow {
        0%,
        100% {
          opacity: 0.3;
          transform: scale(1.5);
        }
        50% {
          opacity: 0.4;
          transform: scale(1.7);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1.5);
          opacity: 0.5;
        }
        50% {
          transform: scale(1.7);
          opacity: 0.3;
        }
      }

      @keyframes wave {
        0% {
          transform: translateX(0) rotateX(45deg);
        }
        100% {
          transform: translateX(-50%) rotateX(45deg);
        }
      }

      @keyframes rain {
        0% {
          transform: translateY(-100vh) rotate(15deg);
          opacity: 0;
        }
        5% {
          opacity: 0.4;
        }
        90% {
          opacity: 0.4;
        }
        100% {
          transform: translateY(100vh) rotate(15deg);
          opacity: 0;
        }
      }

      /* Resto de los estilos se mantienen igual */
      .ambient-controls {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 10;
        display: flex;
        gap: 10px;
      }

      .control-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        backdrop-filter: blur(5px);
        background: rgba(255, 255, 255, 0.2);
        transition: transform 0.3s ease;
      }

      .control-btn:hover {
        transform: scale(1.1);
      }

      .message-container {
        position: absolute;
        left: 8%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(85%, 500px);
        min-width: 280px;
        perspective: 1000px;
        z-index: 10;
        margin: 0 auto; /* Añadido para ayudar con el centrado */
      }

      .message-content {
        background: rgba(255, 255, 255, 0.9);
        padding: min(5vh, 30px) min(5vw, 25px);
        border-radius: clamp(10px, 2vw, 15px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(8px);
        display: flex; /* Añadido para mejorar el centrado */
        justify-content: center; /* Añadido para centrar horizontalmente */
        align-items: center; /* Añadido para centrar verticalmente */
      }

      .message {
        font-family: 'Georgia', serif;
        font-size: clamp(0.875rem, 2vw + 0.5rem, 1.2rem);
        line-height: 1.6;
        color: #2c3e50;
        text-align: center;
        margin: 0;
        position: relative;
        z-index: 1;
        overflow-wrap: break-word;
        hyphens: auto;
        width: 100%; /* Asegura que el texto use todo el ancho disponible */
      }

      @media (max-width: 380px) {
        .message-container {
          width: 92%;
        }

        .message-content {
          padding: 15px;
        }
      }

      /* Ajustes para tablets */
      @media (min-width: 768px) and (max-width: 1024px) {
        .message-container {
          width: 70%;
        }
      }

      /* Ajustes para pantallas grandes */
      @media (min-width: 1200px) {
        .message-container {
          width: 500px;
        }

        .message {
          font-size: 1.2rem;
        }
      }

      /* Ajustes para modo landscape en móviles */
      @media (max-height: 500px) and (orientation: landscape) {
        .message-container {
          width: 60%;
        }

        .message-content {
          padding: 12px 20px;
        }

        .message {
          font-size: 0.9rem;
        }
      }

      .paper-effect {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
              to right,
              rgba(0, 0, 0, 0.05) 1px,
              transparent 1px
            )
            0 0 / 20px 20px,
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px) 0
            0 / 20px 20px;
      }

      .tap-hint {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9em;
        transition: opacity 0.3s ease;
      }

      .tap-hint.hidden {
        opacity: 0;
      }
    `,
  ],
  animations: [
    trigger('messageAnimation', [
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'translateY(20px) rotateX(-90deg)',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'translateY(0) rotateX(0)',
        })
      ),
      transition('hidden => visible', [
        animate('0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'),
      ]),
      transition('visible => hidden', [animate('0.3s ease-in')]),
    ]),
  ],
})
export class LoveMessageComponent implements OnInit {
  isRaining = false;
  isNightMode = false;
  raindrops: Raindrop[] = [];
  messageState = 'hidden';
  messageShown = false;
  currentIndex = 0;

  messages = [
    {
      text: 'Como la lluvia que cae suavemente, así llegan los mensajes que compartimos...',
      mood: 'rain',
    },
    {
      text: 'El mar nos recuerda que aunque estemos lejos, el mismo horizonte nos une.',
      mood: 'ocean',
    },
    {
      text: 'A veces las palabras más bonitas son como atardeceres, pintan de colores nuestros pensamientos.',
      mood: 'sunset',
    },
    {
      text: 'Hay personas que son como poemas: te hacen ver la belleza en los detalles más pequeños.',
      mood: 'gentle',
    },
    {
      text: 'Las mejores historias empiezan despacio, como olas suaves llegando a la orilla.',
      mood: 'ocean',
    },
    {
      text: 'Entre la lluvia y el mar, entre versos y atardeceres, es bonito ir conociéndonos.',
      mood: 'mixed',
    },
  ];

  get currentMessage() {
    return this.messages[this.currentIndex];
  }

  ngOnInit() {
    this.createRaindrops();
  }

  createRaindrops() {
    // Aumentado el número de gotas y ajustado sus propiedades
    this.raindrops = Array(40)
      .fill(0)
      .map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `-${Math.random() * 3}s`,
        // Ajustado el rango de tamaños para las gotas
        size: Math.random() * 1 + 0.5, // Tamaños entre 0.5 y 1.5px
      }));
  }

  showNextMessage() {
    this.messageState = 'hidden';
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.messages.length;
      this.messageState = 'visible';
      this.messageShown = true;

      // Ajustar efectos según el mensaje
      const currentMood = this.currentMessage.mood;
      if (currentMood === 'rain' && !this.isRaining) {
        this.toggleRain();
      } else if (currentMood === 'sunset' && !this.isNightMode) {
        this.toggleTime();
      }
    }, 300);
  }

  // Nuevos métodos para efectos adicionales
  private getRandomCloud() {
    return {
      size: Math.random() * 40 + 60, // Tamaño entre 60 y 100px
      speed: Math.random() * 10 + 10, // Velocidad entre 10 y 20s
      delay: -Math.random() * 20, // Delay inicial aleatorio
      opacity: Math.random() * 0.3 + 0.7, // Opacidad entre 0.7 y 1
    };
  }

  private updateCelestialEffects() {
    const celestial = document.querySelector('.celestial') as HTMLElement;
    if (celestial) {
      if (this.isNightMode) {
        celestial.style.filter = 'blur(1px) brightness(1.2)';
      } else {
        // Efecto especial para el sol del atardecer
        celestial.style.filter = 'blur(2px) brightness(1.3) saturate(1.2)';
      }
    }
  }

  private updateOceanEffects() {
    const ocean = document.querySelector('.ocean') as HTMLElement;
    if (ocean) {
      ocean.style.background = this.isRaining
        ? 'linear-gradient(180deg, rgba(30, 144, 255, 0.8) 0%, rgba(0, 102, 204, 0.9) 100%)'
        : 'linear-gradient(180deg, rgba(30, 144, 255, 0.9) 0%, rgba(0, 102, 204, 1) 100%)';
    }

    const reflection = document.querySelector('.reflection') as HTMLElement;
    if (reflection) {
      reflection.style.opacity = this.isRaining ? '0.4' : '0.6';
    }

    const waves = document.querySelectorAll('.wave') as NodeListOf<HTMLElement>;
    waves.forEach((wave, index) => {
      const baseSpeed = this.isRaining ? 6 : 8;
      const baseHeight = this.isRaining ? 45 : 35;
      wave.style.animationDuration = `${baseSpeed + index}s`;
      wave.style.height = `${baseHeight - index * 4}px`;
      wave.style.opacity = this.isRaining ? '0.5' : '0.7';
    });
  }

  toggleRain() {
    this.isRaining = !this.isRaining;
    if (this.isRaining) {
      this.createRaindrops();
      // Añadir efecto de niebla sutil cuando llueve
      const container = document.querySelector(
        '.scene-container'
      ) as HTMLElement;
      if (container) {
        container.style.filter = this.isNightMode
          ? 'brightness(0.8) contrast(1.1) saturate(0.9)'
          : 'brightness(0.95) contrast(1.05) saturate(0.95)';
      }
    } else {
      // Restaurar filtros normales
      const container = document.querySelector(
        '.scene-container'
      ) as HTMLElement;
      if (container) {
        container.style.filter = this.isNightMode
          ? 'brightness(0.8) contrast(1.2)'
          : 'brightness(1) contrast(1)';
      }
    }
    this.updateOceanEffects();
  }

  toggleTime() {
    this.isNightMode = !this.isNightMode;
    this.updateCelestialEffects();

    // Ajustar la intensidad de las estrellas en modo nocturno
    const container = document.querySelector('.scene-container') as HTMLElement;
    if (container) {
      if (this.isNightMode) {
        this.createStars(container);
      } else {
        this.removeStars(container);
      }
    }
  }

  private createStars(container: HTMLElement) {
    // Crear estrellas para el modo nocturno
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 60}%`; // Solo en la parte superior (cielo)
      star.style.animationDelay = `${Math.random() * 3}s`;
      container.appendChild(star);
    }
  }

  private removeStars(container: HTMLElement) {
    // Eliminar las estrellas al cambiar a modo diurno
    const stars = container.querySelectorAll('.star');
    stars.forEach((star) => star.remove());
  }

  // Método para actualizar los efectos cuando cambian las condiciones
  private updateSceneEffects() {
    this.updateCelestialEffects();
    this.updateOceanEffects();

    const container = document.querySelector('.scene-container') as HTMLElement;
    if (container) {
      if (this.isRaining) {
        container.style.filter = this.isNightMode
          ? 'brightness(0.8) contrast(1.1) saturate(0.9)'
          : 'brightness(0.95) contrast(1.05) saturate(1.1)';
      } else {
        container.style.filter = this.isNightMode
          ? 'brightness(0.8) contrast(1.2)'
          : 'brightness(1) contrast(1.1) saturate(1.2)';
      }
    }
  }
}
