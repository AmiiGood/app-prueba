import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';

interface Raindrop {
  id: number;
  left: string;
  delay: string;
  size: number;
}

interface Message {
  text: string;
  mood: 'rain' | 'ocean' | 'sunset' | 'gentle' | 'mixed';
  animation?: string;
}

@Component({
  selector: 'app-love-message',
  template: `
    <div
      class="scene-container"
      [class.night-mode]="isNightMode"
      [class.raining]="isRaining"
      [@backgroundChange]="getCurrentMood()"
    >
      <!-- Controles ambientales con tooltips -->
      <div class="ambient-controls">
        <button
          (click)="toggleRain()"
          class="control-btn"
          [title]="isRaining ? 'Detener lluvia' : 'Iniciar lluvia'"
        >
          {{ isRaining ? '🌧️' : '☁️' }}
        </button>
        <button
          (click)="toggleTime()"
          class="control-btn"
          [title]="isNightMode ? 'Cambiar a día' : 'Cambiar a noche'"
        >
          {{ isNightMode ? '🌙' : '☀️' }}
        </button>
        <button
          (click)="toggleAudio()"
          class="control-btn"
          [title]="isAudioPlaying ? 'Silenciar' : 'Reproducir música'"
        >
          {{ isAudioPlaying ? '🔊' : '🔈' }}
        </button>
      </div>

      <div class="scene" (click)="showNextMessage()">
        <!-- Cielo con parallax -->
        <div
          class="sky"
          [style.transform]="'translateY(' + parallaxOffset + 'px)'"
        >
          <div
            *ngFor="let cloud of clouds"
            class="cloud"
            [style.width.px]="cloud.size"
            [style.animation-duration.s]="cloud.speed"
            [style.animation-delay.s]="cloud.delay"
            [style.opacity]="cloud.opacity"
          ></div>

          <!-- Estrellas dinámicas -->
          <div *ngIf="isNightMode" class="stars">
            <div
              *ngFor="let star of stars"
              class="star"
              [style.left]="star.left"
              [style.top]="star.top"
              [style.animation-delay]="star.delay"
            ></div>
          </div>
        </div>

        <!-- Lluvia con efecto de profundidad -->
        <div class="rain-container" *ngIf="isRaining">
          <div class="mist"></div>
          <div class="rain-lighting"></div>
          <div
            *ngFor="let layer of rainLayers"
            class="rain-layer"
            [style.z-index]="layer.zIndex"
          >
            <div
              *ngFor="let drop of layer.drops"
              class="raindrop"
              [style.left]="drop.left"
              [style.animation-delay]="drop.delay"
              [style.width.px]="drop.size"
              [style.height.px]="drop.size * 15"
              [style.opacity]="layer.opacity"
            ></div>
          </div>
          <div class="splash"></div>
        </div>

        <!-- Sol/Luna con efectos mejorados -->
        <div
          class="celestial-wrapper"
          [@celestialAnimation]="isNightMode ? 'night' : 'day'"
        >
          <div
            class="celestial"
            [class.sun]="!isNightMode"
            [class.moon]="isNightMode"
            [style.filter]="getCelestialFilter()"
          >
            <div class="glow" [style.opacity]="getGlowOpacity()"></div>
            <ng-container *ngIf="isNightMode">
              <div
                *ngFor="let crater of craters"
                class="crater"
                [style.width.px]="crater.size"
                [style.height.px]="crater.size"
                [style.top]="crater.top"
                [style.left]="crater.left"
              ></div>
            </ng-container>
          </div>
        </div>

        <!-- Océano dinámico -->
        <div
          class="ocean"
          [style.filter]="getOceanFilter()"
          [@oceanAnimation]="getCurrentMood()"
        >
          <div
            *ngFor="let wave of waves; let i = index"
            class="wave"
            [style.animation-duration.s]="wave.speed"
            [style.height.px]="wave.height"
            [style.opacity]="wave.opacity"
          ></div>
          <div
            class="reflection"
            [style.opacity]="getReflectionOpacity()"
          ></div>
        </div>

        <!-- Contenedor de mensajes con efectos de papel -->
        <div
          class="message-container"
          [@messageAnimation]="messageState"
          [class.floating]="currentMessage.mood === 'ocean'"
        >
          <div class="message-content">
            <p class="message" [class.typewriter]="enableTypewriter">
              {{ currentMessage.text }}
            </p>
            <div
              class="paper-effect"
              [style.opacity]="getPaperEffectOpacity()"
            ></div>
          </div>
        </div>
      </div>

      <!-- Indicador de interacción -->
      <div
        class="tap-hint"
        [class.hidden]="messageShown"
        [@hintAnimation]="messageShown ? 'hidden' : 'visible'"
      >
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

      .scene-container.raining {
        filter: brightness(0.95) contrast(1.1) saturate(0.95);
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

      .rain-container {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 5;
        pointer-events: none;
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
          rgba(255, 255, 255, 0.9),
          rgba(255, 255, 255, 0.1)
        );
        transform: rotate(15deg);
        animation: rain 1.5s linear infinite;
        filter: blur(0.3px);
        box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
      }

      .splash {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 50px;
        pointer-events: none;
      }

      .splash-drop {
        position: absolute;
        bottom: 0;
        background: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.4) 0%,
          transparent 70%
        );
        border-radius: 50%;
        animation: splash 0.5s linear forwards;
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
          transform: translateY(-120vh) rotate(15deg);
          opacity: 0;
        }
        5% {
          opacity: 0.8;
        }
        90% {
          opacity: 0.8;
        }
        100% {
          transform: translateY(120vh) rotate(15deg);
          opacity: 0;
        }
      }

      @keyframes splash {
        0% {
          transform: scale(0);
          opacity: 0.7;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }

      .mist {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.02),
          rgba(255, 255, 255, 0.05)
        );
        pointer-events: none;
        animation: mistFloat 8s infinite ease-in-out;
      }

      @keyframes mistFloat {
        0%,
        100% {
          opacity: 0.03;
          transform: translateY(0);
        }
        50% {
          opacity: 0.06;
          transform: translateY(-10px);
        }
      }

      .rain-lighting {
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          circle at 50% 50%,
          rgba(255, 255, 255, 0.03),
          transparent 70%
        );
        mix-blend-mode: screen;
        animation: rainLighting 4s infinite ease-in-out;
      }

      @keyframes rainLighting {
        0%,
        100% {
          opacity: 0.5;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.1);
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
    trigger('backgroundChange', [
      transition('* => *', [animate('1.5s ease-in-out')]),
    ]),
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
    trigger('celestialAnimation', [
      state('day', style({ transform: 'rotate(0deg)' })),
      state('night', style({ transform: 'rotate(180deg)' })),
      transition('day <=> night', animate('1.5s ease-in-out')),
    ]),
    trigger('oceanAnimation', [
      transition('* => *', [animate('1s ease-in-out')]),
    ]),
    trigger('hintAnimation', [
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('visible => hidden', [animate('0.3s ease-out')]),
    ]),
  ],
})
export class LoveMessageComponent implements OnInit, OnDestroy {
  isRaining = false;
  isNightMode = false;
  isAudioPlaying = false;
  messageState = 'hidden';
  messageShown = false;
  currentIndex = 0;
  enableTypewriter = true;
  parallaxOffset = 0;

  private audio: HTMLAudioElement | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private animationFrame!: number;
  private isBrowser!: boolean;

  // Arrays dinámicos
  clouds: Array<{
    size: number;
    speed: number;
    delay: number;
    opacity: number;
  }> = [];
  stars: Array<{ left: string; top: string; delay: string }> = [];
  rainLayers: Array<{ zIndex: number; opacity: number; drops: Raindrop[] }> =
    [];
  waves: Array<{ speed: number; height: number; opacity: number }> = [];
  craters: Array<{ size: number; top: string; left: string }> = [];

  messages: Message[] = [
    {
      text: 'Como la lluvia que cae suavemente, así llegan los mensajes que compartimos...',
      mood: 'rain',
      animation: 'fadeInDown',
    },
    {
      text: 'El mar nos recuerda que aunque estemos lejos, el mismo horizonte nos une.',
      mood: 'ocean',
      animation: 'fadeInUp',
    },
    {
      text: 'A veces las palabras más bonitas son como atardeceres, pintan de colores nuestros pensamientos.',
      mood: 'sunset',
      animation: 'fadeIn',
    },
    {
      text: 'Hay personas que son como poemas: te hacen ver la belleza en los detalles más pequeños.',
      mood: 'gentle',
      animation: 'fadeInRight',
    },
    {
      text: 'Las mejores historias empiezan despacio, como olas suaves llegando a la orilla.',
      mood: 'ocean',
      animation: 'fadeInLeft',
    },
    {
      text: 'Entre la lluvia y el mar, entre versos y atardeceres, es bonito ir conociéndonos.',
      mood: 'mixed',
      animation: 'fadeInUp',
    },
  ];

  get currentMessage(): Message {
    return this.messages[this.currentIndex];
  }

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.initializeAudio();
    }
    if (this.isBrowser) {
      this.setupResizeObserver();
    }
  }

  ngOnInit() {
    this.initializeClouds();
    this.initializeStars();
    this.initializeRainLayers();
    this.initializeWaves();
    this.initializeCraters();
    if (this.isBrowser) {
      this.setupParallaxEffect();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      cancelAnimationFrame(this.animationFrame);
      this.audio?.pause();
    }
  }

  private initializeAudio() {
    if (this.isBrowser) {
      this.audio = new Audio();
      this.audio.src = 'assets/ambient-music.mp3';
      this.audio.loop = true;
    }
  }

  private setupResizeObserver() {
    if (this.isBrowser && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateSceneElements();
      });

      setTimeout(() => {
        const container = document.querySelector('.scene-container');
        if (container && this.resizeObserver) {
          this.resizeObserver.observe(container);
        }
      }, 0);
    }
  }

  private setupParallaxEffect() {
    if (this.isBrowser) {
      window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const moveX = (clientX - innerWidth / 2) * 0.01;
        const moveY = (clientY - innerHeight / 2) * 0.01;

        this.parallaxOffset = moveY;

        this.animationFrame = requestAnimationFrame(() => {
          this.updateParallaxElements(moveX, moveY);
        });
      });
    }
  }

  private updateParallaxElements(moveX: number, moveY: number) {
    if (this.isBrowser) {
      const celestial = document.querySelector('.celestial-wrapper');
      if (celestial) {
        celestial.setAttribute(
          'style',
          `transform: translate(${moveX * 2}px, ${moveY * 2}px);`
        );
      }
    }
  }

  private initializeClouds() {
    this.clouds = Array(5)
      .fill(0)
      .map(() => ({
        size: Math.random() * 40 + 60,
        speed: Math.random() * 10 + 20,
        delay: -Math.random() * 20,
        opacity: Math.random() * 0.3 + 0.7,
      }));
  }

  private initializeStars() {
    this.stars = Array(50)
      .fill(0)
      .map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 60}%`,
        delay: `${Math.random() * 3}s`,
      }));
  }

  private initializeRainLayers() {
    this.rainLayers = Array(4)
      .fill(0)
      .map((_, index) => ({
        zIndex: index + 1,
        opacity: 1 - index * 0.15, // Reducido de 0.2 a 0.1 para más opacidad
        drops: this.createRaindrops(35 - index * 5), // Aumentado de 20 a 30 gotas
      }));
  }

  private initializeWaves() {
    this.waves = Array(4)
      .fill(0)
      .map((_, index) => ({
        speed: 8 + index * 2,
        height: 35 - index * 4,
        opacity: 0.7 - index * 0.1,
      }));
  }

  private initializeCraters() {
    this.craters = Array(5)
      .fill(0)
      .map(() => ({
        size: Math.random() * 15 + 5,
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 70}%`,
      }));
  }

  private createRaindrops(count: number): Raindrop[] {
    return Array(count)
      .fill(0)
      .map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `-${Math.random() * 2}s`, // Reducido de 3s a 2s para más frecuencia
        size: Math.random() * 3 + 1, // Aumentado de 1 a 2 para gotas más grandes
      }));
  }

  showNextMessage() {
    this.messageState = 'hidden';
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.messages.length;
      this.messageState = 'visible';
      this.messageShown = true;

      this.updateSceneBasedOnMood();
    }, 300);
  }

  private updateSceneBasedOnMood() {
    const currentMood = this.currentMessage.mood;

    if (currentMood === 'rain' && !this.isRaining) {
      this.toggleRain();
    }

    if (currentMood === 'sunset' && !this.isNightMode) {
      this.toggleTime();
    }

    this.updateSceneEffects();
  }

  toggleRain() {
    this.isRaining = !this.isRaining;
    if (this.isRaining) {
      this.initializeRainLayers();
    }
    this.updateSceneEffects();
  }

  toggleTime() {
    this.isNightMode = !this.isNightMode;
    this.updateSceneEffects();
  }

  toggleAudio() {
    this.isAudioPlaying = !this.isAudioPlaying;
    if (this.audio) {
      if (this.isAudioPlaying) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    }
  }

  getCurrentMood(): string {
    return this.currentMessage?.mood || 'gentle';
  }

  private updateSceneEffects() {
    if (this.isBrowser) {
      this.updateCelestialEffects();
      this.updateOceanEffects();
      this.updateAtmosphericEffects();
    }
  }

  private updateCelestialEffects() {
    if (this.isBrowser) {
      const celestial = document.querySelector('.celestial') as HTMLElement;
      if (celestial) {
        if (this.isNightMode) {
          celestial.style.filter = `
          blur(1px) 
          brightness(1.2) 
          drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))
        `;
        } else {
          celestial.style.filter = `
          blur(2px) 
          brightness(1.3) 
          saturate(1.2)
          drop-shadow(0 0 15px rgba(255, 200, 100, 0.4))
        `;
        }
      }
    }
  }

  private updateOceanEffects() {
    if (this.isBrowser) {
      const ocean = document.querySelector('.ocean') as HTMLElement;
      if (ocean) {
        const baseColor = this.isNightMode
          ? 'rgba(20, 100, 180, 0.8)'
          : 'rgba(30, 144, 255, 0.8)';

        const gradientColor = this.isNightMode
          ? 'rgba(0, 80, 160, 0.9)'
          : 'rgba(0, 102, 204, 0.9)';

        ocean.style.background = `
        linear-gradient(180deg, 
          ${baseColor} 0%, 
          ${gradientColor} 100%)
      `;

        if (this.isRaining) {
          ocean.style.filter = 'brightness(0.9) contrast(1.1)';
        }
      }

      this.waves.forEach((wave, index) => {
        wave.speed = this.isRaining ? 6 + index : 8 + index * 2;
        wave.height = this.isRaining ? 45 - index * 4 : 35 - index * 4;
        wave.opacity = this.isRaining ? 0.5 - index * 0.1 : 0.7 - index * 0.1;
      });
    }
  }

  private updateAtmosphericEffects() {
    if (this.isBrowser) {
      const container = document.querySelector(
        '.scene-container'
      ) as HTMLElement;
      if (container) {
        let filter = '';

        if (this.isNightMode) {
          filter += 'brightness(0.8) contrast(1.2) ';
          if (this.isRaining) {
            filter += 'saturate(0.9) blur(0.5px)';
          }
        } else {
          filter += 'brightness(1) contrast(1.1) ';
          if (this.isRaining) {
            filter += 'saturate(0.95) blur(0.3px)';
          }
        }

        container.style.filter = filter;
      }
    }
  }

  getCelestialFilter(): string {
    const baseFilter = this.isNightMode
      ? 'blur(1px) brightness(1.2)'
      : 'blur(2px) brightness(1.3) saturate(1.2)';

    const shadowColor = this.isNightMode
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(255, 200, 100, 0.4)';

    return `${baseFilter} drop-shadow(0 0 15px ${shadowColor})`;
  }

  getGlowOpacity(): number {
    return this.isNightMode ? 0.3 : 0.4;
  }

  getOceanFilter(): string {
    let filter = 'brightness(1) contrast(1.1)';

    if (this.isRaining) {
      filter = 'brightness(0.9) contrast(1.2)';
    }

    if (this.isNightMode) {
      filter += ' saturate(0.9)';
    }

    return filter;
  }

  getReflectionOpacity(): number {
    let opacity = 0.6;

    if (this.isRaining) {
      opacity *= 0.7;
    }

    if (this.isNightMode) {
      opacity *= 0.8;
    }

    return opacity;
  }

  getPaperEffectOpacity(): number {
    return this.isNightMode ? 0.07 : 0.05;
  }

  private updateSceneElements() {
    this.initializeClouds();
    this.initializeStars();
    this.initializeRainLayers();
    this.initializeWaves();
    this.updateSceneEffects();
  }

  private createSplash(x: number, y: number) {
    if (this.isBrowser) {
      const splash = document.createElement('div');
      splash.className = 'splash-drop';
      splash.style.left = `${x}px`;
      splash.style.width = `${Math.random() * 10 + 5}px`;
      splash.style.height = `${Math.random() * 10 + 5}px`;

      const splashContainer = document.querySelector('.splash');
      if (splashContainer) {
        splashContainer.appendChild(splash);
        setTimeout(() => splash.remove(), 500);
      }
    }
  }
}

// Estilos adicionales para nuevos efectos
const additionalStyles = `
  .scene-container {
    transition: filter 1.5s ease;
  }

  .celestial-wrapper {
    transition: transform 0.3s ease-out;
  }

  .rain-layer {
      position: absolute;
      width: 100%;
      height: 100%;
      perspective: 1000px;
    }

  .star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    border-radius: 50%;
    animation: twinkle 3s infinite ease-in-out;
  }

  .floating {
    animation: float 6s infinite ease-in-out;
  }

  .typewriter {
    overflow: hidden;
    border-right: 2px solid transparent;
    white-space: nowrap;
    animation: typing 3.5s steps(40, end),
               blink-caret 0.75s step-end infinite;
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }

  @keyframes blink-caret {
    from, to { border-color: transparent }
    50% { border-color: rgba(0, 0, 0, 0.3) }
  }
`;
