// alimentos_data.js — catálogo de alimentos con sus 4 macros por porción
const NUTRI_FOOD_DB = [
  // Proteínas
  { nombre: 'Pechuga de pollo asada', categoria: 'Proteínas', emoji: '🍗', porcion: '100 g', calorias: 165, proteina: 31, carbos: 0,  grasa: 3.6, fibra: 0 },
  { nombre: 'Huevo entero', categoria: 'Proteínas', emoji: '🥚', porcion: '1 pieza', calorias: 78,  proteina: 6.3, carbos: 0.6, grasa: 5.3, fibra: 0 },
  { nombre: 'Claras de huevo', categoria: 'Proteínas', emoji: '🥚', porcion: '3 piezas', calorias: 51,  proteina: 11, carbos: 0.7, grasa: 0.2, fibra: 0 },
  { nombre: 'Atún en agua', categoria: 'Proteínas', emoji: '🐟', porcion: '1 lata (140 g)', calorias: 128, proteina: 29, carbos: 0,  grasa: 0.8, fibra: 0 },
  { nombre: 'Salmón a la plancha', categoria: 'Proteínas', emoji: '🐟', porcion: '100 g', calorias: 208, proteina: 22, carbos: 0,  grasa: 13,  fibra: 0 },
  { nombre: 'Carne molida de res (90/10)', categoria: 'Proteínas', emoji: '🥩', porcion: '100 g', calorias: 176, proteina: 20, carbos: 0,  grasa: 10,  fibra: 0 },
  { nombre: 'Bistec de res', categoria: 'Proteínas', emoji: '🥩', porcion: '100 g', calorias: 217, proteina: 26, carbos: 0,  grasa: 12,  fibra: 0 },
  { nombre: 'Filete de pescado blanco', categoria: 'Proteínas', emoji: '🐟', porcion: '100 g', calorias: 96,  proteina: 20, carbos: 0,  grasa: 1.3, fibra: 0 },
  { nombre: 'Pechuga de pavo', categoria: 'Proteínas', emoji: '🍗', porcion: '100 g', calorias: 135, proteina: 30, carbos: 0,  grasa: 1,   fibra: 0 },
  { nombre: 'Tofu firme', categoria: 'Proteínas', emoji: '🧈', porcion: '100 g', calorias: 144, proteina: 15, carbos: 3,  grasa: 9,   fibra: 1.9 },
  { nombre: 'Camarón cocido', categoria: 'Proteínas', emoji: '🦐', porcion: '100 g', calorias: 99,  proteina: 24, carbos: 0.2, grasa: 0.3, fibra: 0 },
  { nombre: 'Proteína en polvo (whey)', categoria: 'Proteínas', emoji: '🥤', porcion: '1 scoop (30 g)', calorias: 120, proteina: 24, carbos: 3,  grasa: 1.5, fibra: 0 },
  { nombre: 'Jamón de pavo', categoria: 'Proteínas', emoji: '🍖', porcion: '1 rebanada (20 g)', calorias: 19,  proteina: 1.9, carbos: 1.3, grasa: 0.7, fibra: 0 },
  { nombre: 'Jamón de cerdo', categoria: 'Proteínas', emoji: '🍖', porcion: '1 rebanada (20 g)', calorias: 34,  proteina: 3,   carbos: 0.8, grasa: 2,   fibra: 0 },
  { nombre: 'Birria / consomé de chamberete deshebrado', categoria: 'Proteínas', emoji: '🍲', porcion: '1 tazón', calorias: 380, proteina: 40, carbos: 3, grasa: 22, fibra: 0 },

  // Carbohidratos
  { nombre: 'Arroz blanco cocido', categoria: 'Carbohidratos', emoji: '🍚', porcion: '1 taza (158 g)', calorias: 205, proteina: 4.3, carbos: 45, grasa: 0.4, fibra: 0.6 },
  { nombre: 'Arroz integral cocido', categoria: 'Carbohidratos', emoji: '🍚', porcion: '1 taza (195 g)', calorias: 216, proteina: 5,   carbos: 45, grasa: 1.8, fibra: 3.5 },
  { nombre: 'Tortilla de maíz', categoria: 'Carbohidratos', emoji: '🌽', porcion: '1 pieza', calorias: 52,  proteina: 1.4, carbos: 11, grasa: 0.6, fibra: 1.4 },
  { nombre: 'Tortilla de harina', categoria: 'Carbohidratos', emoji: '🫓', porcion: '1 pieza', calorias: 94,  proteina: 2.5, carbos: 15, grasa: 2.5, fibra: 0.9 },
  { nombre: 'Pan integral', categoria: 'Carbohidratos', emoji: '🍞', porcion: '1 rebanada', calorias: 81,  proteina: 4,   carbos: 14, grasa: 1.1, fibra: 1.9 },
  { nombre: 'Avena en hojuelas', categoria: 'Carbohidratos', emoji: '🥣', porcion: '1/2 taza (40 g)', calorias: 150, proteina: 5.3, carbos: 27, grasa: 2.6, fibra: 4 },
  { nombre: 'Papa cocida', categoria: 'Carbohidratos', emoji: '🥔', porcion: '1 mediana (150 g)', calorias: 130, proteina: 2.7, carbos: 30, grasa: 0.2, fibra: 2.4 },
  { nombre: 'Camote cocido', categoria: 'Carbohidratos', emoji: '🍠', porcion: '100 g', calorias: 90,  proteina: 2,   carbos: 21, grasa: 0.2, fibra: 3.3 },
  { nombre: 'Pasta cocida', categoria: 'Carbohidratos', emoji: '🍝', porcion: '1 taza (140 g)', calorias: 220, proteina: 8,   carbos: 43, grasa: 1.3, fibra: 2.5 },
  { nombre: 'Frijoles cocidos', categoria: 'Carbohidratos', emoji: '🫘', porcion: '1 taza (172 g)', calorias: 245, proteina: 15, carbos: 45, grasa: 1,   fibra: 15 },
  { nombre: 'Lentejas cocidas', categoria: 'Carbohidratos', emoji: '🍲', porcion: '1 taza (198 g)', calorias: 230, proteina: 18, carbos: 40, grasa: 0.8, fibra: 16 },
  { nombre: 'Elote', categoria: 'Carbohidratos', emoji: '🌽', porcion: '1 pieza mediana', calorias: 96,  proteina: 3.4, carbos: 21, grasa: 1.5, fibra: 2.4 },
  { nombre: 'Quinoa cocida', categoria: 'Carbohidratos', emoji: '🍚', porcion: '1 taza (185 g)', calorias: 222, proteina: 8,   carbos: 39, grasa: 3.6, fibra: 5.2 },

  // Frutas
  { nombre: 'Manzana', categoria: 'Frutas', emoji: '🍎', porcion: '1 pieza mediana', calorias: 95,  proteina: 0.5, carbos: 25, grasa: 0.3, fibra: 4.4 },
  { nombre: 'Plátano', categoria: 'Frutas', emoji: '🍌', porcion: '1 pieza mediana', calorias: 105, proteina: 1.3, carbos: 27, grasa: 0.4, fibra: 3.1 },
  { nombre: 'Fresas', categoria: 'Frutas', emoji: '🍓', porcion: '1 taza (152 g)', calorias: 49,  proteina: 1,   carbos: 12, grasa: 0.5, fibra: 3 },
  { nombre: 'Naranja', categoria: 'Frutas', emoji: '🍊', porcion: '1 pieza mediana', calorias: 62,  proteina: 1.2, carbos: 15, grasa: 0.2, fibra: 3.1 },
  { nombre: 'Papaya', categoria: 'Frutas', emoji: '🍈', porcion: '1 taza (145 g)', calorias: 62,  proteina: 0.7, carbos: 16, grasa: 0.2, fibra: 2.5 },
  { nombre: 'Mango', categoria: 'Frutas', emoji: '🥭', porcion: '1 taza (165 g)', calorias: 99,  proteina: 1.4, carbos: 25, grasa: 0.6, fibra: 2.6 },
  { nombre: 'Uvas', categoria: 'Frutas', emoji: '🍇', porcion: '1 taza (151 g)', calorias: 104, proteina: 1.1, carbos: 27, grasa: 0.2, fibra: 1.4 },
  { nombre: 'Aguacate', categoria: 'Frutas', emoji: '🥑', porcion: '1/2 pieza', calorias: 120, proteina: 1.5, carbos: 6,  grasa: 11,  fibra: 5 },
  { nombre: 'Sandía', categoria: 'Frutas', emoji: '🍉', porcion: '1 taza (152 g)', calorias: 46,  proteina: 0.9, carbos: 11, grasa: 0.2, fibra: 0.6 },
  { nombre: 'Piña', categoria: 'Frutas', emoji: '🍍', porcion: '1 taza (165 g)', calorias: 82,  proteina: 0.9, carbos: 22, grasa: 0.2, fibra: 2.3 },

  // Verduras
  { nombre: 'Brócoli cocido', categoria: 'Verduras', emoji: '🥦', porcion: '1 taza (156 g)', calorias: 55,  proteina: 3.7, carbos: 11, grasa: 0.6, fibra: 5.1 },
  { nombre: 'Espinaca cruda', categoria: 'Verduras', emoji: '🥬', porcion: '2 tazas (60 g)', calorias: 14,  proteina: 1.7, carbos: 2.2, grasa: 0.2, fibra: 1.3 },
  { nombre: 'Zanahoria', categoria: 'Verduras', emoji: '🥕', porcion: '1 taza rallada (110 g)', calorias: 45,  proteina: 1.1, carbos: 11, grasa: 0.2, fibra: 3.1 },
  { nombre: 'Ensalada mixta', categoria: 'Verduras', emoji: '🥗', porcion: '2 tazas', calorias: 25,  proteina: 1.5, carbos: 5,  grasa: 0.3, fibra: 2 },
  { nombre: 'Calabacita', categoria: 'Verduras', emoji: '🥒', porcion: '1 taza (124 g)', calorias: 20,  proteina: 1.5, carbos: 4.3, grasa: 0.3, fibra: 1.3 },
  { nombre: 'Nopales', categoria: 'Verduras', emoji: '🌵', porcion: '1 taza (86 g)', calorias: 14,  proteina: 1.1, carbos: 3,  grasa: 0.1, fibra: 1.9 },
  { nombre: 'Jitomate', categoria: 'Verduras', emoji: '🍅', porcion: '1 pieza mediana', calorias: 22,  proteina: 1.1, carbos: 4.8, grasa: 0.2, fibra: 1.5 },
  { nombre: 'Cebolla morada', categoria: 'Verduras', emoji: '🧅', porcion: '1/4 taza picada (40 g)', calorias: 16, proteina: 0.4, carbos: 3.7, grasa: 0, fibra: 0.7 },
  { nombre: 'Limón', categoria: 'Verduras', emoji: '🍋', porcion: '1 pieza (67 g)', calorias: 20, proteina: 0.5, carbos: 7, grasa: 0.2, fibra: 1.9 },

  // Lácteos
  { nombre: 'Yogurt griego natural', categoria: 'Lácteos', emoji: '🥛', porcion: '1 taza (245 g)', calorias: 146, proteina: 25, carbos: 8,  grasa: 4,   fibra: 0 },
  { nombre: 'Leche entera', categoria: 'Lácteos', emoji: '🥛', porcion: '1 taza (244 g)', calorias: 149, proteina: 7.7, carbos: 12, grasa: 8,   fibra: 0 },
  { nombre: 'Leche descremada', categoria: 'Lácteos', emoji: '🥛', porcion: '1 taza (245 g)', calorias: 83,  proteina: 8.3, carbos: 12, grasa: 0.2, fibra: 0 },
  { nombre: 'Queso panela', categoria: 'Lácteos', emoji: '🧀', porcion: '50 g', calorias: 95,  proteina: 9,   carbos: 1.5, grasa: 6,   fibra: 0 },
  { nombre: 'Queso cottage', categoria: 'Lácteos', emoji: '🧀', porcion: '1 taza (226 g)', calorias: 206, proteina: 25, carbos: 8,  grasa: 9,   fibra: 0 },
  { nombre: 'Yogurt natural', categoria: 'Lácteos', emoji: '🥛', porcion: '1 taza (245 g)', calorias: 154, proteina: 8.5, carbos: 17, grasa: 8,   fibra: 0 },
  { nombre: 'Queso asadero', categoria: 'Lácteos', emoji: '🧀', porcion: '50 g', calorias: 153, proteina: 10.5, carbos: 1.5, grasa: 12,  fibra: 0 },

  // Grasas
  { nombre: 'Almendras', categoria: 'Grasas', emoji: '🥜', porcion: '23 piezas (28 g)', calorias: 164, proteina: 6,   carbos: 6,  grasa: 14,  fibra: 3.5 },
  { nombre: 'Cacahuates', categoria: 'Grasas', emoji: '🥜', porcion: '28 g', calorias: 161, proteina: 7,   carbos: 4.6, grasa: 14,  fibra: 2.4 },
  { nombre: 'Crema de cacahuate', categoria: 'Grasas', emoji: '🥜', porcion: '1 cda (16 g)', calorias: 94,  proteina: 4,   carbos: 3,  grasa: 8,   fibra: 1 },
  { nombre: 'Aceite de oliva', categoria: 'Grasas', emoji: '🫒', porcion: '1 cda (14 g)', calorias: 119, proteina: 0,   carbos: 0,  grasa: 14,  fibra: 0 },
  { nombre: 'Nueces', categoria: 'Grasas', emoji: '🌰', porcion: '7 mitades (28 g)', calorias: 183, proteina: 4.3, carbos: 3.9, grasa: 18,  fibra: 1.9 },
  { nombre: 'Chía', categoria: 'Grasas', emoji: '🌱', porcion: '1 cda (12 g)', calorias: 58,  proteina: 2,   carbos: 5,  grasa: 3.7, fibra: 4.1 },

  // Bebidas
  { nombre: 'Café negro', categoria: 'Bebidas', emoji: '☕', porcion: '1 taza', calorias: 2,   proteina: 0.3, carbos: 0,  grasa: 0,   fibra: 0 },
  { nombre: 'Agua de jamaica (sin azúcar)', categoria: 'Bebidas', emoji: '🧃', porcion: '1 vaso (250 ml)', calorias: 8,   proteina: 0,   carbos: 2,  grasa: 0,   fibra: 0 },
  { nombre: 'Jugo de naranja natural', categoria: 'Bebidas', emoji: '🧃', porcion: '1 vaso (250 ml)', calorias: 110, proteina: 1.7, carbos: 26, grasa: 0.5, fibra: 0.5 },
  { nombre: 'Refresco', categoria: 'Bebidas', emoji: '🥤', porcion: '1 lata (355 ml)', calorias: 140, proteina: 0,   carbos: 39, grasa: 0,   fibra: 0 },

  // Snacks
  { nombre: 'Barra de proteína', categoria: 'Snacks', emoji: '🍫', porcion: '1 pieza', calorias: 200, proteina: 20,  carbos: 21, grasa: 7,   fibra: 5 },
  { nombre: 'Palomitas naturales', categoria: 'Snacks', emoji: '🍿', porcion: '2 tazas', calorias: 62,  proteina: 2,   carbos: 12, grasa: 0.7, fibra: 2.2 },
  { nombre: 'Chocolate amargo 70%', categoria: 'Snacks', emoji: '🍫', porcion: '1 cuadro (10 g)', calorias: 59,  proteina: 0.8, carbos: 4.6, grasa: 4.2, fibra: 1.1 },
  { nombre: 'Galletas integrales', categoria: 'Snacks', emoji: '🍪', porcion: '4 piezas', calorias: 140, proteina: 2,   carbos: 21, grasa: 5,   fibra: 2 },

  // Antojitos
  { nombre: 'Taco de camarón y quesadilla con fresca', categoria: 'Antojitos', emoji: '🌮', porcion: '1 orden', calorias: 975, proteina: 36, carbos: 117, grasa: 37, fibra: 6 },
  { nombre: 'Ensalada de atún de mamá', categoria: 'Antojitos', emoji: '🥗', porcion: '1 porción', calorias: 430, proteina: 26, carbos: 22, grasa: 28.5, fibra: 4 },
  { nombre: 'Tostada de maíz', categoria: 'Carbohidratos', emoji: '🌽', porcion: '1 pieza', calorias: 55, proteina: 1.5, carbos: 11, grasa: 0.7, fibra: 1.5 },
  { nombre: 'Pan telera de ley', categoria: 'Carbohidratos', emoji: '🍞', porcion: '1 pieza', calorias: 220, proteina: 7, carbos: 40, grasa: 3, fibra: 2 },
  { nombre: 'Torta de jamón mamá', categoria: 'Antojitos', emoji: '🥪', porcion: '1 pieza', calorias: 420, proteina: 17, carbos: 44, grasa: 15, fibra: 4 },
  { nombre: 'Ceviche de camarón mixto mamá', categoria: 'Antojitos', emoji: '🍤', porcion: '1 porción', calorias: 290, proteina: 40, carbos: 14, grasa: 2, fibra: 3 },

  // Agregados después
  { nombre: 'Pescado frito', categoria: 'Proteínas', emoji: '🐟', porcion: '100 g', calorias: 220, proteina: 19, carbos: 8,  grasa: 13,  fibra: 0.5 },
  { nombre: 'Pepino', categoria: 'Verduras', emoji: '🥒', porcion: '1 taza (104 g)', calorias: 16, proteina: 0.7, carbos: 3.8, grasa: 0.1, fibra: 0.5 },
  { nombre: 'Fresca (refresco de toronja)', categoria: 'Bebidas', emoji: '🥤', porcion: '1 botella (500 ml)', calorias: 200, proteina: 0, carbos: 55, grasa: 0, fibra: 0 },
  { nombre: 'Rollo tempura de surimi', categoria: 'Antojitos', emoji: '🍣', porcion: '1 orden (8-10 piezas)', calorias: 580, proteina: 18, carbos: 55, grasa: 28, fibra: 3 },
  { nombre: 'Tostada de camarón y pulpo (aguachile)', categoria: 'Antojitos', emoji: '🍤', porcion: '1/2 tostada', calorias: 225, proteina: 25, carbos: 17, grasa: 8, fibra: 4 },
  { nombre: 'Costillitas en caldillo enchiloso con papa y zanahoria', categoria: 'Antojitos', emoji: '🍖', porcion: '1 plato (300 g)', calorias: 380, proteina: 26, carbos: 22, grasa: 22, fibra: 3 },
  { nombre: 'Té (refill, restaurante de sushi)', categoria: 'Bebidas', emoji: '🍵', porcion: '1.5 vasos (525 ml)', calorias: 10, proteina: 0, carbos: 2, grasa: 0, fibra: 0 },
  { nombre: 'Espagueti con salsa roja', categoria: 'Carbohidratos', emoji: '🍝', porcion: '1 plato (300 g)', calorias: 310, proteina: 9, carbos: 55, grasa: 6, fibra: 4 },
  { nombre: 'Tostitos Flaming Hot (bolsa individual)', categoria: 'Snacks', emoji: '🌶️', porcion: '1 bolsa (50 g)', calorias: 260, proteina: 3, carbos: 30, grasa: 14, fibra: 2 },
  { nombre: 'Té Jaztea (normal)', categoria: 'Bebidas', emoji: '🧃', porcion: '1 litro', calorias: 240, proteina: 0, carbos: 60, grasa: 0, fibra: 0 },
  { nombre: 'Pollo en caldillo con papa y zanahoria', categoria: 'Antojitos', emoji: '🍗', porcion: '1 plato (300 g)', calorias: 280, proteina: 28, carbos: 22, grasa: 9, fibra: 3 },
  { nombre: 'Nieve de vainilla McDonald\'s (cono $10)', categoria: 'Snacks', emoji: '🍦', porcion: '1 cono', calorias: 130, proteina: 3, carbos: 20, grasa: 4, fibra: 0 },
  { nombre: 'Ceviche de salchicha con tostitos y cacahuates japoneses', categoria: 'Antojitos', emoji: '🌭', porcion: '1 porción', calorias: 780, proteina: 21, carbos: 64, grasa: 50, fibra: 5 },
  { nombre: 'Refresco Sprite (500 ml)', categoria: 'Bebidas', emoji: '🥤', porcion: '1 botella (500 ml)', calorias: 200, proteina: 0, carbos: 53, grasa: 0, fibra: 0 }
];

const NUTRI_FOOD_CATS = ['Todos', ...Array.from(new Set(NUTRI_FOOD_DB.map(a => a.categoria)))];

// Recetas — combinaciones de alimentos con macros precalculados
const NUTRI_RECIPES = [
  {
    nombre: 'Desayuno proteico',
    emoji: '🍳',
    ingredientes: '2 huevos + avena + plátano',
    calorias: 411,
    proteina: 19,
    carbos: 55,
    grasa: 14,
    fibra: 7
  },
  {
    nombre: 'Almuerzo fit',
    emoji: '🍗',
    ingredientes: 'Pechuga de pollo + arroz integral + brócoli',
    calorias: 436,
    proteina: 40,
    carbos: 56,
    grasa: 6,
    fibra: 9
  },
  {
    nombre: 'Cena ligera',
    emoji: '🐟',
    ingredientes: 'Atún en agua + ensalada mixta + jitomate',
    calorias: 175,
    proteina: 32,
    carbos: 10,
    grasa: 1,
    fibra: 4
  },
  {
    nombre: 'Snack post-entreno',
    emoji: '🥛',
    ingredientes: 'Yogurt griego + plátano',
    calorias: 251,
    proteina: 26,
    carbos: 35,
    grasa: 4,
    fibra: 3
  },
  {
    nombre: 'Salmón con camote',
    emoji: '🐟',
    ingredientes: 'Salmón a la plancha + camote + espinaca',
    calorias: 312,
    proteina: 26,
    carbos: 23,
    grasa: 13,
    fibra: 5
  },
  {
    nombre: 'Shake muscular',
    emoji: '🥤',
    ingredientes: 'Whey + fresas + almendras',
    calorias: 333,
    proteina: 31,
    carbos: 21,
    grasa: 16,
    fibra: 7
  },
  {
    nombre: 'Bowl de frijoles',
    emoji: '🫘',
    ingredientes: 'Frijoles + arroz blanco + nopales',
    calorias: 464,
    proteina: 20,
    carbos: 93,
    grasa: 2,
    fibra: 18
  },
  {
    nombre: 'Desayuno de claras',
    emoji: '🥚',
    ingredientes: '3 claras de huevo + avena + fresas',
    calorias: 250,
    proteina: 17,
    carbos: 40,
    grasa: 3,
    fibra: 7
  },
  {
    nombre: 'Tazón verde',
    emoji: '🥗',
    ingredientes: 'Pavo + quinoa + brócoli + espinaca',
    calorias: 422,
    proteina: 44,
    carbos: 47,
    grasa: 4,
    fibra: 11
  },
  {
    nombre: 'Cena alta proteína',
    emoji: '🥩',
    ingredientes: 'Bistec + papa cocida + ensalada',
    calorias: 372,
    proteina: 32,
    carbos: 38,
    grasa: 12,
    fibra: 5
  }
];

// PLAN_RECETAS — recetas con ingredientes ajustables (+/−)
// buscar: substring del nombre en NUTRI_FOOD_DB (toLowerCase)
// qty: porciones iniciales · step:0.5 · max:10 en todos
const PLAN_RECETAS = [

  // ─── DESAYUNO ────────────────────────────────────────
  {
    nombre: 'Huevos con Jamón',
    emoji:  '🍳',
    desc:   'Huevos estrellados con jamón',
    cat:    'Desayuno',
    ing: [
      { buscar:'huevo entero',   emoji:'🥚', label:'Huevo',       qty:2, step:0.5, min:0.5, max:10 },
      { buscar:'jamón de pavo',  emoji:'🍖', label:'Jamón pavo',  qty:1, step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Avena Proteica',
    emoji:  '🥣',
    desc:   'Avena con plátano y proteína en polvo',
    cat:    'Desayuno',
    ing: [
      { buscar:'avena',             emoji:'🥣', label:'Avena',   qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'plátano',           emoji:'🍌', label:'Plátano', qty:1,   step:0.5, min:0,   max:10 },
      { buscar:'proteína en polvo', emoji:'🥤', label:'Whey',    qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Claras con Avena',
    emoji:  '🥚',
    desc:   'Claras de huevo, avena y fresas',
    cat:    'Desayuno',
    ing: [
      { buscar:'claras de huevo', emoji:'🥚', label:'Claras',  qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'avena',           emoji:'🥣', label:'Avena',   qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'fresa',           emoji:'🍓', label:'Fresas',  qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Chilaquiles Fit',
    emoji:  '🌮',
    desc:   'Tortillas con huevo, yogurt y jitomate',
    cat:    'Desayuno',
    ing: [
      { buscar:'tortilla de maíz', emoji:'🌽', label:'Tortillas',     qty:4,   step:0.5, min:0.5, max:10 },
      { buscar:'huevo entero',     emoji:'🥚', label:'Huevo',         qty:2,   step:0.5, min:0.5, max:10 },
      { buscar:'yogurt griego',    emoji:'🥛', label:'Yogurt griego', qty:0.5, step:0.5, min:0,   max:10 },
      { buscar:'jitomate',         emoji:'🍅', label:'Jitomate',      qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Desayuno Light',
    emoji:  '🍞',
    desc:   'Pan integral con queso cottage y fruta',
    cat:    'Desayuno',
    ing: [
      { buscar:'pan integral',  emoji:'🍞', label:'Pan integral', qty:2,   step:0.5, min:0.5, max:10 },
      { buscar:'queso cottage', emoji:'🧀', label:'Cottage',      qty:0.5, step:0.5, min:0.5, max:10 },
      { buscar:'fresa',         emoji:'🍓', label:'Fresas',       qty:1,   step:0.5, min:0,   max:10 },
    ]
  },

  // ─── MERIENDA / COLACIÓN ─────────────────────────────
  {
    nombre: 'Shake Post-Entreno',
    emoji:  '🥤',
    desc:   'Proteína whey con plátano y fresas',
    cat:    'Merienda',
    ing: [
      { buscar:'proteína en polvo', emoji:'🥤', label:'Whey',    qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'plátano',           emoji:'🍌', label:'Plátano', qty:1,   step:0.5, min:0,   max:10 },
      { buscar:'fresa',             emoji:'🍓', label:'Fresas',  qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Yogurt con Fruta',
    emoji:  '🥛',
    desc:   'Yogurt griego con fresas y almendras',
    cat:    'Merienda',
    ing: [
      { buscar:'yogurt griego', emoji:'🥛', label:'Yogurt griego', qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'fresa',         emoji:'🍓', label:'Fresas',        qty:1,   step:0.5, min:0,   max:10 },
      { buscar:'almendras',     emoji:'🥜', label:'Almendras',     qty:0.5, step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Manzana con Cacahuate',
    emoji:  '🍎',
    desc:   'Manzana con crema de cacahuate',
    cat:    'Merienda',
    ing: [
      { buscar:'manzana',            emoji:'🍎', label:'Manzana',         qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'crema de cacahuate', emoji:'🥜', label:'Crema cacahuate', qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Colación Proteica',
    emoji:  '🥛',
    desc:   'Queso cottage con nueces y fruta',
    cat:    'Merienda',
    ing: [
      { buscar:'queso cottage', emoji:'🧀', label:'Cottage', qty:0.5, step:0.5, min:0.5, max:10 },
      { buscar:'nueces',        emoji:'🌰', label:'Nueces',  qty:0.5, step:0.5, min:0,   max:10 },
      { buscar:'plátano',       emoji:'🍌', label:'Plátano', qty:0.5, step:0.5, min:0,   max:10 },
    ]
  },

  // ─── COMIDA ───────────────────────────────────────────
  {
    nombre: 'Pollo con Arroz',
    emoji:  '🍗',
    desc:   'Pechuga de pollo con arroz integral y brócoli',
    cat:    'Comida',
    ing: [
      { buscar:'pechuga de pollo', emoji:'🍗', label:'Pollo',   qty:1.5, step:0.5, min:0.5, max:10 },
      { buscar:'arroz integral',   emoji:'🍚', label:'Arroz',   qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'brócoli',          emoji:'🥦', label:'Brócoli', qty:1,   step:0.5, min:0.5, max:10 },
    ]
  },
  {
    nombre: 'Tacos de Bistec',
    emoji:  '🌮',
    desc:   'Bistec con tortillas, cebolla y jitomate',
    cat:    'Comida',
    ing: [
      { buscar:'bistec',           emoji:'🥩', label:'Bistec',         qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'tortilla de maíz', emoji:'🌽', label:'Tortillas maíz', qty:4,   step:0.5, min:0.5, max:10 },
      { buscar:'jitomate',         emoji:'🍅', label:'Jitomate',       qty:1,   step:0.5, min:0,   max:10 },
      { buscar:'ensalada',         emoji:'🥗', label:'Ensalada',       qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Bowl de Salmón',
    emoji:  '🐟',
    desc:   'Salmón con camote y espinaca',
    cat:    'Comida',
    ing: [
      { buscar:'salmón',   emoji:'🐟', label:'Salmón',   qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'camote',   emoji:'🍠', label:'Camote',   qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'espinaca', emoji:'🥬', label:'Espinaca', qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Pasta con Pollo',
    emoji:  '🍝',
    desc:   'Pasta con pechuga de pollo y ensalada',
    cat:    'Comida',
    ing: [
      { buscar:'pasta',            emoji:'🍝', label:'Pasta',    qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'pechuga de pollo', emoji:'🍗', label:'Pollo',    qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'ensalada',         emoji:'🥗', label:'Ensalada', qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Tazón de Quinoa',
    emoji:  '🥗',
    desc:   'Pavo, quinoa, brócoli y espinaca',
    cat:    'Comida',
    ing: [
      { buscar:'pechuga de pavo', emoji:'🍗', label:'Pavo',     qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'quinoa',          emoji:'🍚', label:'Quinoa',   qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'brócoli',         emoji:'🥦', label:'Brócoli',  qty:1,   step:0.5, min:0,   max:10 },
      { buscar:'espinaca',        emoji:'🥬', label:'Espinaca', qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Frijoles con Arroz',
    emoji:  '🫘',
    desc:   'Frijoles con arroz blanco y nopales',
    cat:    'Comida',
    ing: [
      { buscar:'frijoles',     emoji:'🫘', label:'Frijoles',     qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'arroz blanco', emoji:'🍚', label:'Arroz blanco', qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'nopales',      emoji:'🌵', label:'Nopales',      qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Filete con Camote',
    emoji:  '🐟',
    desc:   'Filete de pescado blanco con camote y ensalada',
    cat:    'Comida',
    ing: [
      { buscar:'filete de pescado', emoji:'🐟', label:'Filete pescado', qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'camote',            emoji:'🍠', label:'Camote',         qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'ensalada',          emoji:'🥗', label:'Ensalada',       qty:1,   step:0.5, min:0,   max:10 },
    ]
  },

  // ─── CENA ─────────────────────────────────────────────
  {
    nombre: 'Atún con Ensalada',
    emoji:  '🐟',
    desc:   'Atún en agua con ensalada mixta y jitomate',
    cat:    'Cena',
    ing: [
      { buscar:'atún en agua', emoji:'🐟', label:'Atún',     qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'jitomate',     emoji:'🍅', label:'Jitomate', qty:1,   step:0.5, min:0,   max:10 },
      { buscar:'ensalada',     emoji:'🥗', label:'Ensalada', qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Cena Alta Proteína',
    emoji:  '🥩',
    desc:   'Bistec con papa cocida y ensalada',
    cat:    'Cena',
    ing: [
      { buscar:'bistec',     emoji:'🥩', label:'Bistec',   qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'papa cocida',emoji:'🥔', label:'Papa',     qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'ensalada',   emoji:'🥗', label:'Ensalada', qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Pavo con Verduras',
    emoji:  '🍗',
    desc:   'Pechuga de pavo con brócoli y zanahoria',
    cat:    'Cena',
    ing: [
      { buscar:'pechuga de pavo', emoji:'🍗', label:'Pavo',      qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'brócoli',         emoji:'🥦', label:'Brócoli',   qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'zanahoria',       emoji:'🥕', label:'Zanahoria', qty:1,   step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Camarón con Ensalada',
    emoji:  '🦐',
    desc:   'Camarones con ensalada y aguacate',
    cat:    'Cena',
    ing: [
      { buscar:'camarón',  emoji:'🦐', label:'Camarón',  qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'ensalada', emoji:'🥗', label:'Ensalada', qty:1,   step:0.5, min:0.5, max:10 },
      { buscar:'aguacate', emoji:'🥑', label:'Aguacate', qty:0.5, step:0.5, min:0,   max:10 },
    ]
  },
  {
    nombre: 'Sopa de Lentejas',
    emoji:  '🍲',
    desc:   'Lentejas cocidas con verduras',
    cat:    'Cena',
    ing: [
      { buscar:'lentejas',  emoji:'🍲', label:'Lentejas',  qty:1,   step:0.5, min:0.5, max:3 },
      { buscar:'zanahoria', emoji:'🥕', label:'Zanahoria', qty:1,   step:0.5, min:0,   max:3 },
      { buscar:'jitomate',  emoji:'🍅', label:'Jitomate',  qty:1,   step:0.5, min:0,   max:3 },
    ]
  },
];
