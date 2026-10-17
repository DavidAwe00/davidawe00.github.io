// Spanish (US) translations of js/lessons.js, keyed by lesson id. Quiz choices keep the same order,
// so `answer` indexes come from the English lesson. Numbers use U.S. formatting ($1,000 · 3.9), as
// CFPB and IRS Spanish materials do. Tool and game names stay in English to match the site's buttons.
// When you change a fact in lessons.js, change it here too.
const LESSONS_ES = {
  budgeting: {
    title: "Conceptos básicos del presupuesto",
    summary: "Dile a tu dinero adónde ir en lugar de preguntarte adónde se fue.",
    cards: [
      {
        heading: "Qué es realmente un presupuesto",
        html: `<p>Un presupuesto no es un castigo. Es un <strong>plan para tu dinero</strong> hecho <em>antes</em> de gastarlo.</p>
               <p>Sin un plan, el dinero se escapa en cosas pequeñas. Con uno, tú decides qué es lo más importante para ti, y lo pagas primero.</p>`,
      },
      {
        heading: "La regla 50/30/20",
        html: `<p>Un punto de partida sencillo para tu sueldo neto (después de impuestos):</p>
               <ul>
                 <li><strong>50% necesidades</strong>: renta, comida, servicios, seguros y pagos mínimos de deudas.</li>
                 <li><strong>30% deseos</strong>: comer fuera, streaming, pasatiempos, viajes.</li>
                 <li><strong>20% ahorro y pagos extra de deudas</strong>: tu yo del futuro.</li>
               </ul>
               <p class="small muted">La guía 50/30/20 la popularizaron Elizabeth Warren y Amelia Warren Tyagi en <em>All Your Worth</em> (2005).</p>
               <div class="callout"><strong>Pruébalo:</strong> el <a href="tools.html#budget">Budget Planner</a> divide tu ingreso por ti, o practica con el juego <a href="play.html#envelope">Envelope Budget</a>.</div>`,
      },
      {
        heading: "Págate a ti primero",
        html: `<p>El hábito más poderoso: <strong>pasa dinero a tus ahorros el mismo día que te pagan</strong>, de forma automática. Luego gasta lo que queda.</p>
               <p>Si esperas a ahorrar "lo que sobre", casi nunca sobra nada.</p>`,
      },
    ],
    quiz: [
      {
        q: "En la regla 50/30/20, ¿a qué se destina el 20%?",
        choices: ["Deseos como comer fuera", "Ahorro y pagos extra de deudas", "Renta y comida", "Impuestos"],
        why: "El 20% es para tu futuro: ahorrar, invertir y pagar deudas más rápido que el mínimo.",
      },
      {
        q: "¿Cuál es una 'necesidad' y no un 'deseo'?",
        choices: ["Una suscripción de streaming", "Cambiar a un teléfono nuevo", "La factura de la luz", "Boletos para un concierto"],
        why: "Los servicios como la electricidad son esenciales. Los demás son lujos.",
      },
      {
        q: "¿Qué significa 'págate a ti primero'?",
        choices: [
          "Comprar algo divertido cada día de pago",
          "Ahorrar automáticamente en cuanto te pagan, antes de gastar",
          "Pagar tus cuentas antes que la renta",
          "Pedir un aumento",
        ],
        why: "Ahorrar primero lo vuelve automático, así que de verdad sucede.",
      },
    ],
  },
  "emergency-fund": {
    title: "Tu fondo de emergencia",
    summary: "El colchón que evita que una mala semana se convierta en un mal año.",
    cards: [
      {
        heading: "Por qué necesitas uno",
        html: `<p>Los carros se descomponen. Los trabajos terminan. Los dientes se rompen. Un <strong>fondo de emergencia</strong> es dinero apartado solo para sorpresas como estas.</p>
               <p>Sin él, las emergencias terminan en la tarjeta de crédito, y los intereses altos convierten un problema de $1,000 en uno de $1,300.</p>`,
      },
      {
        heading: "Cuánto ahorrar",
        html: `<ul>
                 <li><strong>Meta inicial:</strong> $1,000 o un mes de gastos.</li>
                 <li><strong>Meta completa:</strong> de 3 a 6 meses de gastos esenciales.</li>
                 <li>Apunta a 6 meses o más si tu ingreso es irregular o mantienes a otras personas.</li>
               </ul>
               <div class="callout"><strong>Pruébalo:</strong> la calculadora <a href="tools.html#emergency">Emergency Fund</a> encuentra tu meta.</div>`,
      },
      {
        heading: "Dónde guardarlo",
        html: `<p>En un lugar <strong>seguro y fácil de alcanzar</strong>, pero no <em>demasiado</em> fácil. Una cuenta de ahorros de alto rendimiento es ideal: genera intereses y está separada de tu cuenta de cheques diaria.</p>
               <p>No inviertas tu fondo de emergencia en acciones. Tiene que estar ahí también cuando el mercado baja.</p>`,
      },
    ],
    quiz: [
      {
        q: "¿Cuál es una meta común para un fondo de emergencia completo?",
        choices: ["Una semana de gastos", "De 3 a 6 meses de gastos esenciales", "10 años de ingresos", "Lo que tengas en la cartera"],
        why: "De 3 a 6 meses cubre la mayoría de las pérdidas de empleo y los gastos grandes inesperados.",
      },
      {
        q: "¿El mejor lugar para un fondo de emergencia?",
        choices: ["Acciones individuales", "Debajo del colchón", "Una cuenta de ahorros de alto rendimiento", "Criptomonedas"],
        why: "Es seguro, genera algo de interés y puedes sacar el dinero rápido.",
      },
      {
        q: "¿Por qué es arriesgado depender de una tarjeta de crédito para emergencias?",
        choices: ["Las tarjetas no funcionan en emergencias", "Los intereses altos hacen que la emergencia cueste más con el tiempo", "Mejora demasiado tu crédito", "No hay ningún riesgo"],
        why: "Las tasas (APR) de las tarjetas suelen pasar del 20%, así que cargar un saldo cuesta mucho.",
      },
    ],
  },
  debt: {
    title: "Acaba con tus deudas",
    summary: "Cómo los intereses juegan en tu contra, y dos maneras probadas de defenderte.",
    cards: [
      {
        heading: "El interés: el precio de pedir prestado",
        html: `<p>Cuando pides prestado, devuelves más de lo que recibiste. Lo extra es el <strong>interés</strong>, expresado como <strong>APR</strong> (tasa de porcentaje anual).</p>
               <p>Un saldo de $5,000 en una tarjeta al 24% de APR, pagando $150 al mes, tarda unos <strong>4½ años</strong> en liquidarse y cuesta más de <strong>$3,300 en intereses</strong>. Si pagas solo $100 al mes, los intereses se comen todo el pago y el saldo <em>nunca</em> baja.</p>`,
      },
      {
        heading: "Avalancha vs. bola de nieve",
        html: `<p>Paga siempre el mínimo de todo. Después, pon cada dólar extra en una sola deuda:</p>
               <ul>
                 <li><strong>Avalancha:</strong> primero la tasa de interés más alta. Ahorra más dinero.</li>
                 <li><strong>Bola de nieve:</strong> primero el saldo más pequeño. Los logros rápidos te mantienen motivado.</li>
               </ul>
               <p>El mejor método es el que vas a mantener.</p>
               <div class="callout"><strong>Pruébalo:</strong> compara los dos en el planificador <a href="tools.html#debt">Debt Payoff</a>.</div>`,
      },
      {
        heading: "Deuda buena vs. deuda mala",
        html: `<p>No todas las deudas son iguales. Una hipoteca con tasa baja o un préstamo estudiantil razonable pueden crear valor a largo plazo. La deuda con interés alto para cosas que pierden valor, como las compras con tarjeta de crédito, es la que hay que eliminar rápido.</p>`,
      },
    ],
    quiz: [
      {
        q: "¿Qué deuda paga primero el método avalancha?",
        choices: ["El saldo más pequeño", "La tasa de interés más alta", "La deuda más nueva", "La que menos te gusta"],
        why: "Atacar la tasa más alta reduce al mínimo el total de intereses que pagas.",
      },
      {
        q: "¿Cuál es la principal ventaja del método bola de nieve?",
        choices: ["El menor total de intereses", "Logros rápidos que aumentan la motivación", "Mejora tu APR", "Lo exigen los bancos"],
        why: "Liquidar saldos pequeños rápido da un impulso psicológico.",
      },
      {
        q: "¿Qué significa APR?",
        choices: ["Tasa de porcentaje anual (Annual Percentage Rate)", "Regla de pago promedio", "Razón de pago de la cuenta", "Rendimiento anual del capital"],
        why: "La APR es el costo anual de pedir prestado, expresado como porcentaje.",
      },
    ],
  },
  "compound-interest": {
    title: "La magia del interés compuesto",
    summary: "Por qué empezar temprano importa más que empezar con mucho.",
    cards: [
      {
        heading: "Interés sobre tu interés",
        html: `<p>El interés compuesto significa que ganas rendimientos sobre tu dinero original <em>y</em> sobre los rendimientos que ya ganó.</p>
               <p>$1,000 que crecen 8% al año se vuelven $1,080, luego $1,166, luego $1,260... El crecimiento mismo sigue creciendo.</p>`,
      },
      {
        heading: "El tiempo es el ingrediente secreto",
        html: `<p>Conoce a dos ahorradores; los dos ganan 8% al año:</p>
               <ul>
                 <li><strong>Alex</strong> invierte $200 al mes de los 25 a los 35 años y luego para. Total aportado: $24,000.</li>
                 <li><strong>Sam</strong> invierte $200 al mes de los 35 a los 65 años. Total aportado: $72,000.</li>
               </ul>
               <p>A los 65, <strong>Alex tiene más</strong>: unos $400,000 contra unos $298,000 de Sam, aunque invirtió la tercera parte. El dinero de Alex simplemente tuvo más tiempo.</p>`,
      },
      {
        heading: "La regla del 72",
        html: `<p>Cálculo mental rápido: divide 72 entre tu rendimiento anual para estimar cuántos años tarda tu dinero en <strong>duplicarse</strong>.</p>
               <p>Al 8%, el dinero se duplica más o menos cada <strong>9 años</strong> (72 ÷ 8). Al 6%, cada 12 años.</p>
               <div class="callout"><strong>Pruébalo:</strong> mira crecer tu dinero en la calculadora <a href="tools.html#compound">Compound Growth</a>.</div>`,
      },
    ],
    quiz: [
      {
        q: "Con la regla del 72, al 9% de rendimiento el dinero se duplica en unos...",
        choices: ["4 años", "8 años", "12 años", "20 años"],
        why: "72 ÷ 9 = 8 años.",
      },
      {
        q: "¿Qué hace tan poderoso al interés compuesto?",
        choices: ["Ganas rendimientos sobre rendimientos anteriores", "El banco agrega un bono", "Está garantizado", "Solo funciona con cantidades grandes"],
        why: "El crecimiento se suma al crecimiento, así que se acelera con el tiempo.",
      },
      {
        q: "El factor más importante que controlas en el interés compuesto suele ser...",
        choices: ["La suerte", "El tiempo: empezar temprano", "Escoger una acción de moda", "Revisar tu saldo a diario"],
        why: "Entre más temprano empiezas, más veces se puede duplicar tu dinero.",
      },
    ],
  },
  credit: {
    title: "Entiende tu puntaje de crédito",
    summary: "El número de tres dígitos que afecta tu renta, tus préstamos y más.",
    cards: [
      {
        heading: "Qué es un puntaje de crédito",
        html: `<p>Un puntaje de crédito (en EE. UU., normalmente de 300 a 850) les dice a los prestamistas qué tan bien pagas lo que te prestan. Un puntaje más alto te da tasas de interés más bajas, más facilidad para rentar un apartamento y, a veces, seguros más baratos.</p>`,
      },
      {
        heading: "Qué mueve tu puntaje",
        html: `<ul>
                 <li><strong>Historial de pagos (~35%)</strong>: paga a tiempo, siempre.</li>
                 <li><strong>Cantidades adeudadas (~30%)</strong>: mantén tus saldos por debajo del 30% de tus límites (menos del 10% es aún mejor).</li>
                 <li><strong>Antigüedad del historial (~15%)</strong>: las cuentas antiguas ayudan.</li>
                 <li><strong>Crédito nuevo (~10%)</strong> y <strong>combinación de créditos (~10%)</strong>.</li>
               </ul>`,
      },
      {
        heading: "Hábitos sencillos que funcionan",
        html: `<p>Programa pagos automáticos de al menos el mínimo. No cierres tu tarjeta más antigua. Revisa tus reportes de crédito gratis al menos una vez al año y disputa cualquier error.</p>`,
      },
    ],
    quiz: [
      {
        q: "¿Qué factor tiene más impacto en la mayoría de los puntajes de crédito?",
        choices: ["Tu ingreso", "El historial de pagos", "Tu edad", "Cuántas cuentas de banco tienes"],
        why: "Pagar a tiempo es cerca del 35% de un puntaje FICO típico.",
      },
      {
        q: "Una buena guía para el uso de crédito es mantenerte por debajo del...",
        choices: ["30% de tu límite", "75% de tu límite", "100% de tu límite", "No hay ninguna guía"],
        why: "Usar poco de tu límite muestra que no dependes demasiado del crédito.",
      },
      {
        q: "¿Por qué cerrar tu tarjeta más antigua podría bajar tu puntaje?",
        choices: ["Acorta tu historial de crédito y reduce el crédito disponible", "Los bancos cobran una comisión", "No afecta nada", "Aumenta tu ingreso"],
        why: "Las cuentas antiguas y los límites totales más altos ayudan a tu puntaje.",
      },
    ],
  },
  investing: {
    title: "Inversión 101",
    summary: "Acciones, fondos indexados y por qué lo aburrido es hermoso.",
    cards: [
      {
        heading: "Qué significa invertir",
        html: `<p>Invertir es comprar cosas que esperas que suban de valor o te paguen ingresos con el tiempo, como un pedacito de una empresa (una <strong>acción</strong>) o un préstamo a un gobierno o empresa (un <strong>bono</strong>).</p>
               <p>Invertir tiene riesgo: los valores suben <em>y</em> bajan. Por eso es para dinero que no vas a necesitar en 5 años o más.</p>`,
      },
      {
        heading: "Fondos indexados: compra todo el pajar",
        html: `<p>En lugar de buscar la única acción ganadora (la aguja), un <strong>fondo indexado</strong> compra un poco de cientos o miles de empresas a la vez.</p>
               <ul>
                 <li><strong>Diversificado</strong>: si una empresa quiebra, casi no importa.</li>
                 <li><strong>De bajo costo</strong>: las comisiones suelen ser menores al 0.1% al año.</li>
                 <li><strong>Difícil de superar</strong>: la mayoría de los profesionales que escogen acciones rinden menos que el índice a largo plazo.</li>
               </ul>`,
      },
      {
        heading: "Usa cuentas con ventajas fiscales",
        html: `<p>Muchos países ofrecen cuentas de jubilación con beneficios fiscales. En EE. UU., las principales son el <strong>401(k)</strong> del trabajo (¡aprovecha cualquier aportación equivalente del empleador, es dinero gratis!) y la <strong>IRA</strong> que abres por tu cuenta.</p>
               <div class="callout"><strong>Recuerda:</strong> esto es educación, no asesoría financiera personal. Considera hablar con un asesor fiduciario con licencia sobre tu situación.</div>`,
      },
    ],
    quiz: [
      {
        q: "¿Qué es un fondo indexado?",
        choices: ["Una sola acción arriesgada", "Un fondo que tiene una parte amplia del mercado", "Una cuenta de ahorros", "Un tipo de préstamo"],
        why: "Los fondos indexados siguen todo un índice del mercado y reparten el riesgo entre muchas empresas.",
      },
      {
        q: "El dinero que vas a necesitar en 6 meses normalmente debería estar...",
        choices: ["Invertido en acciones", "En una cuenta de ahorros", "En criptomonedas", "Prestado a tus amigos"],
        why: "El dinero de corto plazo no debería exponerse a los altibajos del mercado.",
      },
      {
        q: "La aportación equivalente (match) del empleador a tu 401(k) se describe mejor como...",
        choices: ["Una comisión", "Dinero gratis que deberías intentar aprovechar", "Un tipo de impuesto", "Un préstamo de tu jefe"],
        why: "Es dinero extra que se agrega a tu jubilación solo por aportar.",
      },
    ],
  },
  inflation: {
    title: "Inflación: el impuesto invisible",
    summary: "Por qué un dólar compra menos cada año, y cómo mantenerte al día.",
    cards: [
      {
        heading: "Los precios suben poco a poco",
        html: `<p>La <strong>inflación</strong> es el aumento general de los precios con el tiempo. EE. UU. la mide con el <strong>Índice de Precios al Consumidor (CPI)</strong>, que sigue el costo de una gran canasta de bienes y servicios cotidianos.</p>
               <p>En 2025, los precios en general eran unas <strong>3.9 veces</strong> los de 1980. Algo que costaba $100 entonces costaba unos $390 en 2025.</p>
               <div class="callout"><strong>Pruébalo:</strong> la <a href="invest.html#inflation">calculadora de inflación</a> convierte cualquier cantidad entre 1926 y 2025.</div>`,
      },
      {
        heading: "Números pequeños, gran efecto",
        html: `<p>De 1928 a 2025, la inflación promedió cerca de <strong>3% al año</strong>. Parece poco, pero reduce a la mitad el poder de compra de un dólar más o menos cada <strong>23 años</strong>.</p>
               <p>Algunos años son mucho peores: los precios subieron <strong>13.3% en 1979</strong> y <strong>6.5% en 2022</strong>. Y al inicio de la Gran Depresión, los precios incluso <em>bajaron</em> (deflación).</p>`,
      },
      {
        heading: "Cómo vencerla",
        html: `<p>El dinero que se queda quieto pierde valor. Después de la inflación, de 1928 a 2025:</p>
               <ul>
                 <li><strong>Efectivo en letras del Tesoro (T-bills):</strong> cerca de <strong>+0.3%</strong> al año; apenas se mantuvo.</li>
                 <li><strong>Bonos del Tesoro a 10 años:</strong> cerca de <strong>+1.5%</strong> al año.</li>
                 <li><strong>Acciones (S&amp;P 500):</strong> cerca de <strong>+6.8%</strong> al año.</li>
               </ul>
               <p>Por eso el dinero de largo plazo normalmente va en inversiones, mientras que el efectivo es para emergencias y metas de corto plazo. Que tu ingreso crezca (aumentos, nuevas habilidades) es la otra gran defensa contra la inflación.</p>
               <div class="callout"><strong>Juega:</strong> adivina los precios de hoy en <a href="play.html#prices">Price Time Machine</a>.</div>`,
      },
    ],
    quiz: [
      {
        q: "¿Qué mide el Índice de Precios al Consumidor (CPI)?",
        choices: ["El desempeño de la bolsa", "Los cambios en los precios de bienes y servicios cotidianos", "Los sueldos promedio", "Las tasas de interés"],
        why: "El CPI sigue el costo de una canasta típica de bienes y servicios, así que es la medida principal de la inflación.",
      },
      {
        q: "Con una inflación de cerca de 3% al año, el poder de compra de un dólar se reduce a la mitad en unos…",
        choices: ["3 años", "10 años", "23 años", "100 años"],
        why: "Con la regla del 72: 72 ÷ 3 ≈ 24 años. La cifra exacta al 3.04% es de unos 23.",
      },
      {
        q: "Después de la inflación, ¿qué aumentó más el poder de compra de 1928 a 2025?",
        choices: ["Efectivo debajo del colchón", "Letras del Tesoro", "Acciones", "Todos igual"],
        why: "Las acciones rindieron cerca de 6.8% al año después de la inflación; las letras del Tesoro, cerca de 0.3%; el efectivo debajo del colchón perdió valor cada año que subieron los precios.",
      },
    ],
  },
  "risk-time": {
    title: "Riesgo, tiempo y diversificación",
    summary: "Por qué las acciones asustan en un año pero son sorprendentemente confiables en 20.",
    cards: [
      {
        heading: "El riesgo depende del tiempo",
        html: `<p>De 1928 a 2025, las acciones de EE. UU. (el S&amp;P 500) promediaron cerca de <strong>10% al año</strong>, pero perdieron dinero en <strong>26 de esos 98 años</strong>. El peor año, 1931, fue de <strong>−43.8%</strong>.</p>
               <p>Si las mantienes más tiempo, la historia cambia. En ese mismo periodo, ningún plazo de 20 años invertido en acciones de EE. UU. terminó con pérdida.</p>
               <div class="callout"><strong>Pruébalo:</strong> mueve el tiempo de inversión en el <a href="invest.html#portfolio">portfolio builder</a> y mira cómo baja la probabilidad de perder.</div>`,
      },
      {
        heading: "Diversificación: no le apuestes a un solo caballo",
        html: `<p>Tener una sola empresa es una apuesta: puede llegar a cero. Tener <strong>cientos o miles</strong> a través de un fondo indexado significa que ninguna quiebra por sí sola te puede hundir.</p>
               <p>Agregar bonos suaviza aún más el camino. Una mezcla de 60% acciones y 40% bonos promedió históricamente cerca de 8.3% al año, con un peor año cercano a −27% en lugar de −44%.</p>`,
      },
      {
        heading: "El riesgo más grande: tú",
        html: `<p>Hasta ahora, los mercados siempre se han recuperado. Las pérdidas que se vuelven permanentes suelen ocurrir cuando la gente <strong>entra en pánico y vende cerca del fondo</strong>, y luego se pierde la recuperación.</p>
               <p>Escoge una mezcla que puedas sostener durante una caída, automatiza tus inversiones y evita revisar tu saldo todos los días.</p>
               <div class="callout"><strong>Siéntelo:</strong> sobrevive a dos caídas en el juego <a href="play.html#market">Market Rollercoaster</a>.</div>`,
      },
    ],
    quiz: [
      {
        q: "¿Más o menos con qué frecuencia tuvieron un año con pérdidas las acciones de EE. UU. de 1928 a 2025?",
        choices: ["Casi nunca", "Cerca de 1 de cada 4 años", "Un año sí y uno no", "3 de cada 4 años"],
        why: "26 años con pérdidas de 98: más o menos uno de cada cuatro. Las pérdidas son normales; son el precio de mayores rendimientos a largo plazo.",
      },
      {
        q: "¿Qué suele reducir la probabilidad de perder dinero en acciones?",
        choices: ["Revisar los precios a diario", "Mantenerlas por más tiempo", "Comprar una acción de moda", "Vender después de cada caída"],
        why: "En plazos más largos, los años buenos y malos tienden a compensarse.",
      },
      {
        q: "Agregar bonos a un portafolio de acciones normalmente…",
        choices: ["Aumenta la peor caída posible", "Suaviza el camino pero reduce el crecimiento a largo plazo", "Garantiza ganancias", "No tiene ningún efecto"],
        why: "Los bonos amortiguan las caídas, a cambio de rendimientos promedio algo menores.",
      },
    ],
  },
  "retirement-accounts": {
    title: "Cuentas de jubilación 101",
    summary: "401(k), Roth IRA, HSA: los contenedores con ventajas fiscales para tus inversiones.",
    cards: [
      {
        heading: "La cuenta es el contenedor",
        html: `<p>Una cuenta como un 401(k) o una IRA no es una inversión en sí: es un <strong>contenedor</strong> con beneficios fiscales. Adentro, tú escoges las inversiones, como fondos indexados.</p>
               <p>Esos beneficios importan mucho: a lo largo de décadas, no pagar impuestos sobre el crecimiento puede sumar <strong>decenas o cientos de miles de dólares</strong>.</p>`,
      },
      {
        heading: "Las tres grandes (EE. UU., límites de 2026)",
        html: `<ul>
                 <li><strong>401(k)</strong> del trabajo: hasta <strong>$24,500 al año</strong>. Muchos empleadores <em>igualan</em> parte de lo que aportas; eso es dinero gratis.</li>
                 <li><strong>IRA</strong> que abres por tu cuenta: hasta <strong>$7,500 al año</strong>.</li>
                 <li><strong>HSA</strong> con un plan de salud de deducible alto: hasta <strong>$4,400</strong> (individual) o <strong>$8,750</strong> (familiar).</li>
               </ul>
               <div class="callout"><strong>Compara todas las cuentas:</strong> mira la <a href="invest.html#accounts">guía de cuentas</a> en el Investing Hub.</div>`,
      },
      {
        heading: "Roth vs. tradicional",
        html: `<p><strong>Tradicional:</strong> no pagas impuestos ahora; los pagas cuando retiras el dinero en la jubilación.</p>
               <p><strong>Roth:</strong> pagas impuestos ahora y luego el dinero crece y sale <strong>libre de impuestos</strong>.</p>
               <p>Regla general: si esperas una tasa de impuestos <em>más alta</em> en el futuro (común en jóvenes al inicio de su carrera), la Roth suele ganar.</p>
               <div class="callout"><strong>Pruébalo:</strong> la calculadora <a href="tools.html#roth">Roth vs Traditional</a> usa los tramos de impuestos de 2026, y <a href="tools.html#retire">Retirement Check</a> te muestra si vas por buen camino.</div>`,
      },
    ],
    quiz: [
      {
        q: "¿Cuál es el límite de aportación a una IRA en 2026 (menores de 50 años)?",
        choices: ["$2,000", "$7,500", "$24,500", "No hay límite"],
        why: "$7,500 en 2026, compartido entre la IRA tradicional y la Roth.",
      },
      {
        q: "Con una cuenta Roth, ¿cuándo pagas impuestos?",
        choices: ["Cuando retiras el dinero en la jubilación", "Ahora, sobre el dinero que aportas", "Nunca", "Cada año sobre el crecimiento"],
        why: "Aportas dinero que ya pagó impuestos; los retiros calificados después están libres de impuestos.",
      },
      {
        q: "Tu empleador iguala tus aportaciones al 401(k). ¿Cuál suele ser el primer paso inteligente?",
        choices: ["Ignorarlo", "Aportar al menos lo suficiente para recibir la igualación completa", "Invertir solo en una cuenta sujeta a impuestos", "Esperar hasta los 40"],
        why: "La igualación es un rendimiento instantáneo del 50% al 100% sobre tu dinero. Aprovéchala primero.",
      },
    ],
  },
  "college-roi": {
    title: "¿Vale la pena la universidad?",
    summary: "Piensa en un título como una inversión: costo, beneficio y alternativas.",
    cards: [
      {
        heading: "En promedio, sí",
        html: `<p>En 2024, los trabajadores de tiempo completo con licenciatura ganaron una mediana de <strong>$1,543 a la semana (~$80,000 al año)</strong>, contra <strong>$930 a la semana (~$48,000 al año)</strong> con solo diploma de preparatoria (high school). Su tasa de desempleo también fue menor: <strong>2.5% contra 4.2%</strong>.</p>
               <p>Pero los promedios esconden diferencias enormes. <em>Qué</em> estudias y <em>cuánto pagas</em> importan mucho.</p>`,
      },
      {
        heading: "La carrera importa",
        html: `<p>Entre los recién graduados (de 22 a 27 años), el sueldo mediano va de unos <strong>$90,000</strong> (ingeniería en computación) y <strong>$85,000</strong> (ingeniería química y aeroespacial) hasta cerca de <strong>$40,000–46,000</strong> en algunas carreras de artes, educación y ciencias sociales.</p>
               <p>Algunas carreras también tienen mucho <strong>subempleo</strong>: graduados que trabajan en empleos que no requieren título.</p>
               <div class="callout"><strong>Explora:</strong> compara las 73 carreras en el <a href="college.html#majors">College hub</a>.</div>`,
      },
      {
        heading: "El costo importa igual",
        html: `<p>Colegiatura y cuotas promedio 2025–26: <strong>$4,150</strong> en un colegio comunitario (community college), <strong>$11,950</strong> en una universidad pública del estado donde vives, <strong>$31,880</strong> fuera del estado y <strong>$45,000</strong> en una privada (antes de becas).</p>
               <p>Decisiones inteligentes: llena la FAFSA, considera 2 años en un colegio comunitario, quédate en tu estado y trata de pedir prestado <strong>no más de lo que esperas ganar en tu primer año</strong>. Muchos oficios especializados y carreras de salud de 2 años también pagan muy bien.</p>
               <div class="callout"><strong>Haz tus números:</strong> la calculadora <a href="college.html#roi">Degree ROI</a> encuentra la edad en que recuperas la inversión.</div>`,
      },
    ],
    quiz: [
      {
        q: "¿Más o menos cuánto ganaron quienes tienen licenciatura contra quienes solo terminaron la preparatoria en 2024 (mediana, tiempo completo)?",
        choices: ["Más o menos lo mismo", "~$80K contra ~$48K al año", "~$200K contra ~$30K", "Los de preparatoria ganaron más"],
        why: "BLS: $1,543 a la semana contra $930 a la semana; más o menos $80,000 contra $48,000 al año.",
      },
      {
        q: "Una buena regla general para los préstamos estudiantiles es pedir prestado…",
        choices: ["Todo lo que te ofrezcan", "En total, no más de lo que esperas ganar en tu primer año", "Solo préstamos privados", "Exactamente $100,000"],
        why: "Mantener la deuda total por debajo de tu sueldo inicial hace que los pagos sean manejables.",
      },
      {
        q: "¿Qué puede reducir mucho el costo de una licenciatura?",
        choices: ["Empezar en un colegio comunitario y luego transferirte", "Estudiar un quinto año", "No llenar la FAFSA", "Escoger universidades públicas de otro estado"],
        why: "La colegiatura en un colegio comunitario promedia unos $4,150 al año contra $11,950 en una pública de tu estado.",
      },
    ],
  },
  "taxes-101": {
    title: "Impuestos 101: tramos y cheques de pago",
    summary: "Por qué un aumento nunca reduce tu cheque, y qué es el FICA.",
    cards: [
      {
        heading: "Los tramos son cubetas",
        html: `<p>En 2026, EE. UU. tiene siete tasas federales de impuesto sobre la renta, del <strong>10% al 37%</strong>. Pero no todo tu ingreso paga la misma tasa.</p>
               <p>Imagina cubetas: los primeros dólares llenan la cubeta del 10%, los siguientes la del 12%, y así sucesivamente. La tasa de cada cubeta se aplica <strong>solo a los dólares que hay dentro</strong>. Así que pasar a un tramo más alto solo grava los dólares <em>extra</em> con la tasa más alta: un aumento nunca puede bajar tu sueldo neto.</p>
               <div class="callout"><strong>Míralo:</strong> mueve tu ingreso en la gráfica de <a href="taxes.html#brackets">cubetas de impuestos</a>.</div>`,
      },
      {
        heading: "Las deducciones reducen el ingreso gravable",
        html: `<p>Antes de aplicar los tramos, restas las deducciones. La mayoría usa la <strong>deducción estándar</strong>: <strong>$16,100</strong> para personas solteras y <strong>$32,200</strong> para matrimonios que declaran en conjunto en 2026.</p>
               <p>Las aportaciones antes de impuestos al 401(k) y las primas de seguro médico también reducen tu ingreso gravable; por eso ahorrar para la jubilación desde el trabajo cuesta menos de lo que parece.</p>`,
      },
      {
        heading: "FICA: el otro impuesto de tu cheque",
        html: `<p>Además del impuesto sobre la renta, casi todos los cheques de pago pagan <strong>FICA</strong>: <strong>6.2%</strong> para el Seguro Social (sobre salarios de hasta $184,500 en 2026) y <strong>1.45%</strong> para Medicare. Tu empleador paga una cantidad igual.</p>
               <p>Tu formulario W-4 le dice a tu empleador cuánto impuesto sobre la renta retener. Un reembolso enorme no es dinero gratis: es tu propio dinero, devuelto sin intereses.</p>
               <div class="callout"><strong>Pruébalo:</strong> el <a href="taxes.html#paycheck">desglose del cheque de pago</a> muestra adónde va cada dólar.</div>`,
      },
    ],
    quiz: [
      {
        q: "Pasas del tramo del 12% al del 22%. ¿Qué paga el 22%?",
        choices: ["Todo tu ingreso", "Solo los dólares por encima del límite del 22%", "Solo tu bono", "No cambia nada"],
        why: "Los tramos son marginales: solo los dólares dentro de la cubeta del 22% pagan el 22%.",
      },
      {
        q: "¿Cuál es la deducción estándar de 2026 para una persona soltera?",
        choices: ["$5,000", "$12,400", "$16,100", "$32,200"],
        why: "$16,100 para personas solteras ($32,200 para matrimonios que declaran en conjunto). $12,400 es donde termina el tramo del 10%.",
      },
      {
        q: "¿Qué paga el FICA?",
        choices: ["Las carreteras estatales", "El Seguro Social y Medicare", "Tu 401(k)", "Los reembolsos del impuesto federal"],
        why: "FICA = 6.2% para el Seguro Social + 1.45% para Medicare, retenidos de tu salario.",
      },
    ],
  },
  "rent-vs-buy": {
    title: "Rentar o comprar casa",
    summary: "Hipotecas, patrimonio y los costos ocultos de ser dueño.",
    cards: [
      {
        heading: "Cómo funciona una hipoteca",
        html: `<p>Una hipoteca es un préstamo para comprar una casa, normalmente a <strong>15 o 30 años</strong>. A mediados de octubre de 2026, la tasa fija promedio a 30 años era de cerca de <strong>7.40%</strong> (Freddie Mac).</p>
               <p>Los primeros pagos son casi todo <strong>interés</strong>; con el tiempo, una parte mayor va al <strong>capital</strong>, que es lo que construye tu patrimonio (equity). En un préstamo a 30 años con esa tasa, puedes pagar más en intereses de lo que costó la casa.</p>
               <div class="callout"><strong>Míralo:</strong> la <a href="housing.html#mortgage">calculadora de hipoteca</a> muestra adónde van los pagos de cada año.</div>`,
      },
      {
        heading: "Más que la hipoteca",
        html: `<p>Los dueños también pagan <strong>impuesto predial</strong> (en promedio, cerca de 0.89% del valor al año en 2024), <strong>seguro</strong>, <strong>mantenimiento</strong> y, muchas veces, <strong>seguro hipotecario (PMI)</strong> si dan menos del 20% de enganche. Los costos de cierre normalmente suman de 2% a 5% al inicio.</p>
               <p>HUD considera "con carga de costos" a los hogares que gastan más del <strong>30% de su ingreso</strong> en vivienda.</p>`,
      },
      {
        heading: "Rentar no es 'tirar el dinero'",
        html: `<p>Quienes rentan no pagan mantenimiento, impuesto predial ni grandes costos iniciales, y pueden invertir el dinero del enganche. Quienes compran construyen patrimonio y fijan su pago.</p>
               <p>Cuál conviene depende sobre todo de <strong>cuánto tiempo te quedes</strong>: un comprador puede tardar varios años en compensar los costos de cierre y de venta.</p>
               <div class="callout"><strong>Compara:</strong> prueba la <a href="housing.html#rentbuy">calculadora de rentar vs. comprar</a> con tus números.</div>`,
      },
    ],
    quiz: [
      {
        q: "Al inicio de una hipoteca a 30 años, la mayor parte de cada pago va a…",
        choices: ["Capital", "Intereses", "Impuesto predial", "El agente inmobiliario"],
        why: "El interés se cobra sobre el saldo pendiente, que es más grande al principio.",
      },
      {
        q: "En un préstamo convencional, normalmente se requiere PMI cuando…",
        choices: ["Pagas en efectivo", "Tu enganche es menor al 20%", "Tu puntaje de crédito pasa de 800", "Compras un condominio"],
        why: "El seguro hipotecario protege al prestamista cuando das menos del 20% de enganche.",
      },
      {
        q: "¿Qué es lo que más importa para saber si comprar le gana a rentar?",
        choices: ["El color de la casa", "Cuánto tiempo te vas a quedar", "Tu banco favorito", "Si es entre semana"],
        why: "Comprar tiene costos únicos grandes (cierre y venta) que tardan años en compensarse con el patrimonio que acumulas.",
      },
    ],
  },
  "student-loans-2026": {
    title: "Préstamos estudiantiles: las reglas de 2026",
    summary: "RAP vs. el Plan Estándar Escalonado: qué cambió y cómo escoger.",
    cards: [
      {
        heading: "Dos planes para préstamos nuevos",
        html: `<p>A partir del <strong>1 de julio de 2026</strong>, los préstamos estudiantiles federales nuevos tienen dos opciones de pago:</p>
               <ul>
                 <li><strong>Plan Estándar Escalonado (Tiered Standard Plan):</strong> pagos fijos. El plazo depende de tu saldo: 10 años si debes menos de $25,000 y hasta 25 años si debes $100,000 o más.</li>
                 <li><strong>Plan de Asistencia para el Pago (RAP):</strong> pagos basados en tu ingreso.</li>
               </ul>
               <p>La tasa de los préstamos federales de licenciatura para 2026–27 es de <strong>6.52%</strong>, fija durante toda la vida del préstamo.</p>`,
      },
      {
        heading: "Cómo funciona el RAP",
        html: `<p>El RAP cobra del 1% al 10% de tu ingreso anual (ingreso bruto ajustado), dividido entre 12. El porcentaje sube un punto por cada $10,000 arriba de $10,000, hasta un máximo de 10% arriba de $100,000. Se reduce <strong>$50 por cada dependiente</strong>, y el mínimo es de <strong>$10 al mes</strong>.</p>
               <p>Tiene dos ayudas incluidas: el interés que tu pago no cubre se <strong>perdona</strong>, y el gobierno agrega hasta <strong>$50 al mes</strong> al capital si tu pago casi no lo reduce. Lo que quede después de <strong>30 años</strong> se perdona (y podría pagar impuestos).</p>
               <div class="callout"><strong>Compara:</strong> prueba los dos planes con tus números en el <a href="credit.html#student">Credit &amp; Debt hub</a>.</div>`,
      },
      {
        heading: "Escoge con cuidado",
        html: `<p>El <strong>Estándar Escalonado</strong> normalmente cuesta menos en total si puedes pagar la mensualidad. El <strong>RAP</strong> te protege cuando tu ingreso es bajo o inestable, pero conforme sube tu ingreso también sube tu pago, y pagar durante décadas puede sumar mucho.</p>
               <p>En cualquier caso: siempre puedes pagar de más sin penalización. Liquidar más rápido los préstamos con tasa alta es un rendimiento garantizado igual a la tasa de interés.</p>`,
      },
    ],
    quiz: [
      {
        q: "En el RAP, ¿cuál es el pago mensual mínimo?",
        choices: ["$0", "$10", "$50", "$100"],
        why: "El RAP nunca baja de $10 al mes, aunque tu ingreso sea muy bajo.",
      },
      {
        q: "En el Plan Estándar Escalonado, ¿qué determina cuántos años pagas?",
        choices: ["Tu ingreso", "El saldo de tu préstamo", "Dónde está tu universidad", "Tu puntaje de crédito"],
        why: "Los saldos más grandes tienen plazos más largos: de 10 años (menos de $25,000) hasta 25 años ($100,000 o más).",
      },
      {
        q: "En el RAP, ¿qué pasa con el interés que tu pago no cubre?",
        choices: ["Se suma a tu saldo", "Se perdona", "Se duplica", "Se manda a cobranza"],
        why: "En el RAP, el interés mensual no pagado se perdona, así que el saldo no se dispara.",
      },
    ],
  },
};

// Returns the lesson in the requested language, falling back to English for anything missing.
function localizeLesson(lesson, lang) {
  const es = lang === "es" && LESSONS_ES[lesson.id];
  if (!es) return lesson;
  return {
    ...lesson, title: es.title, summary: es.summary, cards: es.cards,
    quiz: lesson.quiz.map((q, i) => ({ ...q, ...es.quiz[i] })),
  };
}
