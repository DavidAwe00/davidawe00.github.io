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
  scams: {
    title: "Cómo detectar estafas y proteger tu identidad",
    summary: "Las señales de alerta que comparten todas las estafas, y qué hacer si caes en una.",
    cards: [
      {
        heading: "Las estafas son un gran negocio",
        html: `<p>En 2025, la gente en EE. UU. presentó <strong>3 millones de reportes de fraude</strong> ante la Comisión Federal de Comercio (FTC) y reportó pérdidas de <strong>$15.9 mil millones</strong>, la cifra más alta registrada. El tipo más común fueron las <strong>estafas de impostores</strong>: alguien que se hace pasar por tu banco, una empresa de entregas, el gobierno, un jefe o un amigo.</p>
               <p>La forma más común de primer contacto fue un <strong>mensaje de texto</strong>. Las mayores pérdidas vinieron de <strong>pagos bancarios</strong>, seguidos de <strong>criptomonedas</strong>.</p>
               <p class="small muted">Fuente: testimonio de la FTC ante el Comité Económico Conjunto del Congreso, 25 de marzo de 2026 (datos de Consumer Sentinel 2025). La mayoría de los fraudes nunca se reportan, así que las pérdidas reales son mayores.</p>`,
      },
      {
        heading: "Las cuatro señales de alerta",
        html: `<p>Casi todas las estafas usan alguna combinación de estas:</p>
               <ul>
                 <li><strong>Presión para actuar ya</strong>: "Tu cuenta se cerrará hoy", "Paga en la próxima hora o habrá una orden de arresto".</li>
                 <li><strong>Una forma rara de pagar</strong>: tarjetas de regalo, criptomonedas, transferencias bancarias o apps de pago. La FTC dice que solo los estafadores exigen tarjetas de regalo.</li>
                 <li><strong>Te piden códigos o contraseñas</strong>: las empresas reales nunca piden el código de un solo uso que te acaban de enviar.</li>
                 <li><strong>Demasiado bueno para ser verdad</strong>: un trabajo que paga $500 al día por "darle like a publicaciones", un premio de un concurso en el que nunca participaste, un apartamento barato que no puedes ver en persona.</li>
               </ul>
               <div class="callout"><strong>Practica:</strong> clasifica mensajes realistas en el juego <a href="play.html#scam">Spot the Scam</a>.</div>`,
      },
      {
        heading: "Estafas dirigidas a jóvenes",
        html: `<ul>
                 <li><strong>Trabajos falsos y "tareas" en línea</strong>: te pagan un poco y luego te piden depositar dinero para "desbloquear" ganancias más grandes.</li>
                 <li><strong>Cheques falsos</strong>: alguien te "paga de más" y te pide que le devuelvas la diferencia. Días después el cheque rebota y le debes al banco.</li>
                 <li><strong>Compras y reventas en línea</strong>: boletos de conciertos, tenis o artículos de videojuegos que nunca llegan, pagados con una app que no puede revertir el pago.</li>
                 <li><strong>Estafas de renta</strong>: un "dueño" quiere un depósito antes de que veas el lugar o firmes un contrato.</li>
               </ul>
               <p>Las apps de pago funcionan como entregar efectivo. Si le mandas dinero a un estafador, quizá no lo recuperes.</p>`,
      },
      {
        heading: "Protege tu identidad",
        html: `<ul>
                 <li><strong>No uses el enlace ni el número que viene en un mensaje.</strong> Entra a la app de la empresa o llama al número de tu tarjeta.</li>
                 <li><strong>Activa la verificación en dos pasos</strong> y usa una contraseña diferente para cada cuenta (un administrador de contraseñas ayuda).</li>
                 <li><strong>Congela tu crédito</strong> en Equifax, Experian y TransUnion. Es gratis por ley federal y evita que alguien abra cuentas a tu nombre. Puedes descongelarlo cuando solicites crédito.</li>
                 <li><strong>Revisa tus cuentas</strong> cada semana, y tus reportes de crédito gratis en AnnualCreditReport.com.</li>
               </ul>`,
      },
      {
        heading: "Si caes en una estafa",
        html: `<p>Actúa rápido y no sientas vergüenza: los estafadores son profesionales.</p>
               <ol>
                 <li><strong>Llama de inmediato a tu banco o app de pago</strong> y pide que detengan o reviertan el pago.</li>
                 <li><strong>Cambia tus contraseñas</strong> de cualquier cuenta que hayas compartido, empezando por tu correo.</li>
                 <li><strong>Repórtalo</strong> en ReportaFraude.ftc.gov. Si alguien usó tu identidad, obtén un plan de recuperación en RobodeIdentidad.gov.</li>
               </ol>
               <p>Cuidado con los servicios de "recuperación" que prometen devolverte el dinero a cambio de un pago. Muchas veces es una segunda estafa.</p>`,
      },
    ],
    quiz: [
      {
        q: "Un texto dice que tu cuenta bancaria está bloqueada y te pide responder con el código que te acaba de enviar. ¿Qué haces?",
        choices: ["Respondo rápido con el código", "Hago clic en el enlace para revisar", "Lo ignoro y contacto a mi banco por su app o el número de mi tarjeta", "Se lo reenvío a un amigo"],
        why: "Los bancos reales nunca piden tu código de un solo uso. Contáctalos por un medio en el que ya confías.",
      },
      {
        q: "¿Qué solicitud de pago es la mayor señal de alerta?",
        choices: ["Una factura de servicios que puedes pagar en línea", "Alguien que te pide pagar con tarjetas de regalo", "Una tienda que acepta tarjeta de crédito", "Tu escuela pidiendo la cuota de una excursión en su portal"],
        why: "La FTC dice que solo los estafadores exigen pagos con tarjetas de regalo. En cuanto compartes los números, el dinero se pierde.",
      },
      {
        q: "¿Qué hace un congelamiento de crédito?",
        choices: ["Baja tu puntaje de crédito", "Evita que se abran cuentas nuevas a tu nombre", "Cancela tus tarjetas actuales", "Cuesta $30 por cada agencia"],
        why: "El congelamiento impide que los prestamistas consulten tu reporte, así que los ladrones de identidad no pueden abrir cuentas nuevas. Es gratis y no afecta tu puntaje.",
      },
    ],
  },
  banking: {
    title: "Conceptos básicos de la banca: cuentas, intereses y cargos",
    summary: "Elige las cuentas correctas, gana intereses de verdad y deja de pagar cargos innecesarios.",
    cards: [
      {
        heading: "Cuenta de cheques vs. cuenta de ahorros",
        html: `<ul>
                 <li><strong>La cuenta de cheques</strong> es para el dinero del día a día: ahí llega tu sueldo, y de ahí salen los pagos con tu tarjeta de débito, tus facturas y tus apps de pago.</li>
                 <li><strong>La cuenta de ahorros</strong> es para el dinero que no vas a gastar este mes, como tu fondo de emergencia o una meta. Paga intereses, y tenerla separada hace más difícil gastarla por accidente.</li>
               </ul>
               <p>Los bancos y las cooperativas de crédito (credit unions) ofrecen ambas. Las cooperativas son organizaciones sin fines de lucro que pertenecen a sus socios y muchas veces cobran menos cargos.</p>`,
      },
      {
        heading: "Dónde ahorras importa",
        html: `<p>En septiembre de 2026, la cuenta de ahorros promedio en EE. UU. pagaba apenas <strong>0.37%</strong> al año (tasa nacional de la FDIC). Las mejores cuentas de ahorro de alto rendimiento en línea pagaban alrededor de <strong>4%</strong> (Bankrate).</p>
               <p>Con $5,000 durante un año, eso es unos <strong>$19</strong> de interés contra unos <strong>$200</strong>, por el mismo dinero y la misma seguridad.</p>
               <p>Los depósitos están asegurados hasta <strong>$250,000</strong> por persona, por banco y por tipo de titularidad: por la FDIC en los bancos o la NCUA en las cooperativas. El dinero que se queda en una app de pago podría no estar asegurado a menos que se pase a un banco.</p>
               <p class="small muted">Las tasas cambian seguido y algunas de las más altas son promocionales. Revisa el APY actual antes de abrir una cuenta.</p>`,
      },
      {
        heading: "Los cargos que se comen tu dinero",
        html: `<p>Cargos bancarios promedio en 2025 (Bankrate):</p>
               <ul>
                 <li><strong>Sobregiro:</strong> $26.77 cada vez que gastas más de lo que tienes y el banco lo cubre.</li>
                 <li><strong>Fondos insuficientes (NSF):</strong> $16.82 cuando un pago rebota.</li>
                 <li><strong>Cajero fuera de la red:</strong> $4.86 por retiro, sumando el cargo de tu banco y el del dueño del cajero.</li>
               </ul>
               <p>Un sobregiro por un café de $5 lo convierte en un café de $32, y pueden caer varios en un solo día.</p>
               <div class="callout"><strong>Practica:</strong> encuentra todos los cargos en un estado de cuenta con el juego <a href="play.html#fees">Fee Hunter</a>.</div>`,
      },
      {
        heading: "Cómo pagar $0 en cargos",
        html: `<ul>
                 <li><strong>Elige una cuenta sin cargos</strong> (sin cuota mensual ni saldo mínimo), o cumple las reglas para que te la perdonen, muchas veces un depósito directo.</li>
                 <li><strong>No aceptes la cobertura de sobregiro</strong> para débito y cajeros. Por ley, los bancos necesitan tu autorización para cobrarte sobregiros en esas compras, así que una tarjeta rechazada te cuesta $0.</li>
                 <li><strong>Activa alertas de saldo bajo</strong> en la app de tu banco.</li>
                 <li><strong>Usa los cajeros de la red de tu banco</strong>, o pide efectivo al pagar en una tienda.</li>
               </ul>`,
      },
    ],
    quiz: [
      {
        q: "La cuenta de ahorros promedio pagaba 0.37% y las de alto rendimiento cerca de 4%. Con $5,000 durante un año, ¿cuánto más gana la de alto rendimiento, aproximadamente?",
        choices: ["Unos $2", "Unos $18", "Unos $180", "Unos $2,000"],
        why: "$5,000 × 4% ≈ $200, contra $5,000 × 0.37% ≈ $19. La diferencia es de unos $180 sin hacer nada diferente.",
      },
      {
        q: "¿Cuánto protege el seguro de la FDIC o la NCUA por persona, por banco y por tipo de titularidad?",
        choices: ["$2,500", "$25,000", "$250,000", "Sin límite"],
        why: "Los depósitos están asegurados hasta $250,000. Si el banco quiebra, recuperas tu dinero asegurado.",
      },
      {
        q: "¿Qué es lo que más probablemente te ahorra cargos por sobregiro en compras con tarjeta de débito?",
        choices: ["Aceptar la cobertura de sobregiro", "No aceptar la cobertura de sobregiro y activar alertas de saldo bajo", "Usar cajeros fuera de la red", "Guardar el dinero en una app de pago"],
        why: "Sin tu autorización, los bancos no pueden cobrarte sobregiros en compras con débito ni retiros en cajeros; la compra simplemente se rechaza.",
      },
    ],
  },
  insurance: {
    title: "Seguros 101: salud, auto, inquilino y vida",
    summary: "Paga un poco ahora para que un mal día no te deje en ceros.",
    cards: [
      {
        heading: "Cómo funcionan los seguros",
        html: `<p>Pagas una <strong>prima</strong> (un precio mensual o anual). A cambio, la aseguradora paga las pérdidas grandes que te costaría cubrir por tu cuenta: una hospitalización, un choque o una laptop robada.</p>
               <p>Miles de personas pagan, a unas pocas les va mal, y las primas las cubren. La regla general: <strong>asegúrate contra las pérdidas que no podrías pagar</strong>, y cubre las pequeñas con tu fondo de emergencia.</p>`,
      },
      {
        heading: "Palabras del seguro médico",
        html: `<ul>
                 <li><strong>Prima:</strong> lo que pagas cada mes, aunque nunca vayas al médico.</li>
                 <li><strong>Deducible:</strong> lo que pagas por tu atención médica cada año antes de que el plan empiece a compartir los costos. El deducible individual promedio en planes de trabajo fue de <strong>$1,886</strong> en 2025 (KFF).</li>
                 <li><strong>Copago / coseguro:</strong> tu parte después del deducible, como $25 por consulta o el 20% de la cuenta.</li>
                 <li><strong>Máximo de gastos de bolsillo:</strong> lo máximo que pagas en un año (sin contar las primas). Para 2026, los planes no pueden fijarlo por encima de <strong>$10,600</strong> por persona.</li>
               </ul>
               <p>La mayoría de los planes cubren la atención preventiva, como chequeos y vacunas, sin costo, y normalmente puedes seguir en el plan de tus padres hasta los <strong>26 años</strong>.</p>
               <div class="callout"><strong>Practica:</strong> elige el plan más barato para distintos años de la vida real en el juego <a href="play.html#plans">Plan Picker</a>.</div>`,
      },
      {
        heading: "Seguro de auto",
        html: `<ul>
                 <li><strong>Responsabilidad civil</strong> paga los daños y lesiones que causas a otros. Casi todos los estados lo exigen.</li>
                 <li><strong>Colisión</strong> repara tu auto después de un choque; <strong>cobertura amplia</strong> cubre robo, granizo o atropellar un venado. Los prestamistas normalmente exigen ambas si tienes un préstamo de auto.</li>
               </ul>
               <p>Los conductores jóvenes pagan más porque tienen más accidentes. Formas de pagar menos: quedarte en la póliza familiar, sacar buenas calificaciones (muchas aseguradoras dan descuento), manejar con cuidado y elegir un deducible más alto si tienes ahorros para cubrirlo.</p>`,
      },
      {
        heading: "Seguro de inquilino",
        html: `<p>El seguro de tu casero cubre el edificio, <strong>no tus cosas</strong>. El seguro de inquilino cubre tus pertenencias en caso de incendio, robo o daños por agua, paga un lugar donde quedarte si tienes que salir, e incluye <strong>responsabilidad civil</strong> si alguien se lastima en tu casa.</p>
               <p>Cuesta en promedio unos <strong>$170 al año</strong>, alrededor de $14 al mes (Insurance Information Institute, con datos de la NAIC).</p>`,
      },
      {
        heading: "Seguro de vida y de discapacidad",
        html: `<p>El <strong>seguro de vida</strong> importa cuando alguien depende de tu ingreso, como una pareja o hijos. El <strong>seguro de vida a término</strong> cubre un número fijo de años y es mucho más barato que el <strong>seguro de vida entera</strong>, que mezcla seguro con una cuenta de ahorro.</p>
               <p>El <strong>seguro de discapacidad</strong> reemplaza parte de tu sueldo si una enfermedad o lesión te impide trabajar. Para la mayoría de los trabajadores jóvenes, su capacidad de ganar dinero es su mayor activo. Revisa si tu trabajo lo ofrece.</p>`,
      },
    ],
    quiz: [
      {
        q: "Tu plan tiene un deducible de $1,500 y 20% de coseguro. Te llega una cuenta de $4,000. ¿Cuánto pagas (si aún no has cubierto el deducible)?",
        choices: ["$800", "$1,500", "$2,000", "$4,000"],
        why: "$1,500 de deducible, más el 20% de los $2,500 restantes ($500) = $2,000.",
      },
      {
        q: "¿Qué hace el máximo de gastos de bolsillo?",
        choices: ["Limita tu prima mensual", "Limita lo que pagas por atención cubierta en un año", "Fija el precio de una consulta", "Limita cuántos médicos puedes ver"],
        why: "Una vez que pagas el máximo en deducibles, copagos y coseguro, el plan paga el 100% de la atención cubierta el resto del año.",
      },
      {
        q: "Un incendio daña tu edificio de apartamentos. ¿Quién paga para reemplazar tu laptop y tu ropa?",
        choices: ["El seguro de tu casero", "Tu seguro de inquilino, si lo tienes", "Los bomberos", "Tu seguro médico"],
        why: "La póliza del casero cubre el edificio, no las pertenencias de los inquilinos. Para eso es el seguro de inquilino.",
      },
    ],
  },
  "car-buying": {
    title: "Cómo comprar tu primer auto",
    summary: "El costo real de un auto, nuevo vs usado, y cómo no salir quemado con el préstamo.",
    cards: [
      {
        heading: "El precio es solo el comienzo",
        html: `<p>AAA calcula que tener y manejar un auto nuevo cuesta unos <strong>$12,863 al año</strong> (unos $1,072 al mes) cuando sumas todo para 15,000 millas de manejo.</p>
               <p>El costo más grande no es la gasolina. Es la <strong>depreciación</strong>, el valor que pierde el auto, de unos <strong>$4,422 al año</strong>. El seguro promedia unos $2,098 al año, y los conductores jóvenes normalmente pagan más.</p>
               <p class="small muted">Fuente: AAA, <em>Your Driving Costs</em> 2026.</p>`,
      },
      {
        heading: "Nuevo vs. usado",
        html: `<p>En septiembre de 2026, el auto nuevo promedio se vendió en <strong>$50,562</strong> (Kelley Blue Book). El auto usado promedio se anunciaba en <strong>$27,235</strong> (Cox Automotive).</p>
               <p>Los autos nuevos pierden valor más rápido en sus primeros años, así que un auto confiable de algunos años suele darte más por tu dinero. Antes de comprar uno usado:</p>
               <ul>
                 <li>Pide una <strong>inspección previa a la compra</strong> a un mecánico independiente.</li>
                 <li>Revisa el <strong>historial del vehículo</strong> y busca retiros (recalls) pendientes con el VIN en NHTSA.gov.</li>
               </ul>`,
      },
      {
        heading: "El préstamo puede costar más de lo que crees",
        html: `<p>Los préstamos para autos nuevos promediaron cerca de <strong>7% de APR</strong> en el tercer trimestre de 2026, con un pago promedio de <strong>$787 al mes</strong>, y un récord de <strong>1 de cada 4</strong> préstamos para autos nuevos fue de 84 meses (7 años) o más (Edmunds). Los préstamos para autos usados suelen tener tasas más altas.</p>
               <ul>
                 <li><strong>Obtén una preaprobación</strong> en un banco o cooperativa de crédito antes de ir a comprar, para saber tu tasa y compararla con la oferta del concesionario.</li>
                 <li><strong>Negocia el precio final total</strong> (out-the-door), no el pago mensual. Un pago más bajo con un préstamo más largo puede costar miles más.</li>
                 <li>Una guía común es <strong>20/4/10</strong>: 20% de enganche, un préstamo de 4 años o menos, y gastos totales del auto por debajo del 10% de tu ingreso bruto.</li>
               </ul>
               <div class="callout"><strong>Haz las cuentas:</strong> la calculadora <a href="tools.html#car">Car Cost</a> compara plazos de préstamo y tu costo mensual total.</div>`,
      },
      {
        heading: "¿Te conviene un arrendamiento (lease)?",
        html: `<p>Un <strong>lease</strong> es una renta a largo plazo: pagos más bajos, pero al final no eres dueño de nada. Los leases limitan cuántas millas manejas al año y cobran por millas extra y desgaste.</p>
               <p>Puede tener sentido si quieres un auto nuevo cada pocos años y manejas de forma predecible. Si quieres el costo más bajo a largo plazo, comprar un auto confiable y conservarlo muchos años normalmente gana.</p>`,
      },
    ],
    quiz: [
      {
        q: "Un vendedor te pregunta: \"¿Qué pago mensual estás buscando?\". ¿Cuál es la respuesta más inteligente?",
        choices: ["Decir el pago más alto que puedes pagar", "Decir que vas a negociar el precio final total", "Pedir el préstamo más largo disponible", "Aceptar lo que sea con tal de que sea menos de $500"],
        why: "Si te enfocas en el pago mensual, el precio o el plazo pueden subir sin que lo notes. Negocia primero el precio total.",
      },
      {
        q: "Pides prestados $25,000 al 9% de APR. ¿Cuánto interés más pagas, aproximadamente, con un préstamo de 84 meses que con uno de 48?",
        choices: ["Unos $400", "Unos $1,000", "Unos $3,900", "Unos $12,000"],
        why: "A 48 meses: unos $4,862 de interés. A 84 meses: unos $8,787. El pago más bajo te cuesta unos $3,900 más.",
      },
      {
        q: "Según AAA, ¿cuál es el mayor costo anual de tener un auto nuevo?",
        choices: ["La gasolina", "La depreciación (valor perdido)", "Los cambios de aceite", "El registro del vehículo"],
        why: "La depreciación promedió unos $4,422 al año, más que el seguro o la gasolina.",
      },
    ],
  },
  betting: {
    title: "Las matemáticas de las apuestas deportivas y los juegos de azar",
    summary: "Por qué la casa siempre gana con el tiempo, y cómo las apps de apuestas te mantienen jugando.",
    cards: [
      {
        heading: "Las apuestas están en todas partes",
        html: `<p>En una encuesta de Pew Research de 2025, el <strong>31% de los adultos de 18 a 29 años</strong> dijo haber apostado dinero en deportes en el último año, más que cualquier otro grupo de edad.</p>
               <p>En 2025, en EE. UU. se apostaron unos <strong>$167 mil millones</strong> en casas de apuestas legales, que se quedaron con unos <strong>$17 mil millones</strong> (American Gaming Association). Eso es unos <strong>10 centavos de cada dólar</strong> apostado.</p>
               <p class="small muted">En la mayoría de los estados donde es legal, debes tener 21 años para apostar en deportes.</p>`,
      },
      {
        heading: "Cómo los momios esconden la ventaja de la casa",
        html: `<p>Una apuesta típica aparece como <strong>−110</strong>: arriesgas $110 para ganar $100. Si el partido es realmente 50/50, ganarías $100 la mitad de las veces y perderías $110 la otra mitad.</p>
               <p>Eso es una pérdida promedio de <strong>$5 por cada apuesta de $110</strong>, una ventaja de 4.5% para la casa de apuestas. Aunque ganes la mitad de tus apuestas, pierdes dinero.</p>
               <p>Todos los juegos de azar funcionan así. La ruleta americana se queda en promedio con el 5.26%, y la probabilidad de ganar el premio mayor del Powerball es de <strong>1 en 292,201,338</strong>.</p>
               <div class="callout"><strong>Pruébalo:</strong> juega <a href="play.html#betting">Beat the Book</a> y luego mira qué pasa cuando 10,000 jugadores hacen las mismas apuestas.</div>`,
      },
      {
        heading: "Parlays: pagos grandes, ventaja más grande",
        html: `<p>Un <strong>parlay</strong> combina varias apuestas, y todas tienen que ganar. Un parlay de 4 apuestas a −110 paga cerca de <strong>12 a 1</strong>, pero cuatro volados seguidos solo salen 1 vez de cada 16.</p>
               <p>Un pago justo sería 15 a 1, así que la casa se queda en promedio con cerca del <strong>17%</strong>, casi cuatro veces la ventaja de una apuesta sencilla. Las casas de apuestas promueven los parlays porque ganan más con ellos.</p>`,
      },
      {
        heading: "Diseñadas para que sigas jugando",
        html: `<ul>
                 <li><strong>Las "apuestas de bono" y promociones</strong> muchas veces exigen que apuestes mucho más antes de poder retirar.</li>
                 <li><strong>Los casi-aciertos</strong> (te faltó una apuesta para ganar un gran parlay) se sienten como que casi ganas, así que vuelves a jugar.</li>
                 <li><strong>La falacia del jugador:</strong> después de cinco derrotas, una victoria no "te toca". Cada apuesta es independiente.</li>
                 <li><strong>Perseguir pérdidas</strong>, apostar más para recuperar lo perdido, es una señal de alerta de un problema con el juego.</li>
               </ul>`,
      },
      {
        heading: "Si decides apostar",
        html: `<ul>
                 <li>Tómalo como <strong>entretenimiento que pagas</strong>, como un boleto de concierto, no como una forma de ganar dinero.</li>
                 <li>Fija un límite que puedas perder <strong>antes</strong> de empezar, y nunca uses dinero de facturas, renta o deudas.</li>
                 <li>Usa los límites de depósito y las pausas de la app.</li>
               </ul>
               <p>Si apostar deja de ser divertido, hay ayuda gratuita y confidencial las 24 horas en la Línea Nacional de Ayuda para el Juego Problemático: llama o envía un texto al <strong>1-800-MY-RESET</strong> (1-800-697-3738), o chatea en ncpgambling.org/chat.</p>`,
      },
    ],
    quiz: [
      {
        q: "Apuestas $110 para ganar $100 en partidos que son volados 50/50. Si ganas exactamente la mitad de tus apuestas, ¿qué pasa?",
        choices: ["Quedas a mano", "Pierdes dinero", "Ganas dinero", "Depende del deporte"],
        why: "Cada victoria paga $100 pero cada derrota cuesta $110, así que pierdes unos $5 por apuesta en promedio. Esa diferencia es la ventaja de la casa.",
      },
      {
        q: "¿Por qué las casas de apuestas promueven tanto los parlays?",
        choices: ["Son las apuestas más seguras", "Su ventaja para la casa es mucho mayor que en las apuestas sencillas", "Pagan momios justos", "La ley lo exige"],
        why: "Un parlay de 4 apuestas paga cerca de 12 a 1 por algo que sale 1 vez de cada 16, así que la casa se queda en promedio con cerca del 17%, contra un 4.5% en una apuesta sencilla.",
      },
      {
        q: "Perdiste cinco apuestas seguidas. ¿Qué es cierto sobre la siguiente?",
        choices: ["Ya te toca ganar", "Su probabilidad es la misma que antes", "Deberías duplicar tu apuesta", "Las rachas perdedoras siempre terminan en seis"],
        why: "Las apuestas son independientes. Creer que \"te toca\" ganar es la falacia del jugador, y duplicar para recuperarlo es perseguir pérdidas.",
      },
    ],
  },
  "side-hustle": {
    title: "Trabajos extra e impuestos de trabajo por cuenta propia",
    summary: "El dinero de los trabajos por encargo es ingreso real. Así se le cobran impuestos y así te quedas con más.",
    cards: [
      {
        heading: "Trabajo W-2 vs. trabajo 1099",
        html: `<p>En un <strong>trabajo W-2</strong> normal, tu empleador retiene impuestos de cada cheque y paga la mitad de tu impuesto de Seguro Social y Medicare.</p>
               <p>Como <strong>contratista independiente</strong> (entregas, viajes compartidos, trabajos freelance, reventa, tutorías), nadie te retiene nada. Tú eres el negocio, así que manejas tus propios impuestos, incluidas las dos mitades del Seguro Social y Medicare.</p>`,
      },
      {
        heading: "Todo cuenta, con formulario o sin él",
        html: `<p>A partir de 2026, un negocio solo tiene que enviarte un <strong>Formulario 1099-NEC</strong> si te pagó <strong>$2,000</strong> o más en el año (antes eran $600). Las apps de pago y los marketplaces envían un <strong>1099-K</strong> solo después de <strong>$20,000 y 200 transacciones</strong>.</p>
               <p>Pero esas son reglas de reporte para los negocios, no límites libres de impuestos. <strong>Todo el ingreso por cuenta propia paga impuestos</strong>, y debes presentar una declaración cuando tus ganancias netas por cuenta propia llegan a <strong>$400</strong>.</p>`,
      },
      {
        heading: "El impuesto de trabajo por cuenta propia",
        html: `<p>Sobre tu ganancia pagas <strong>15.3% de impuesto de trabajo por cuenta propia</strong> (12.4% de Seguro Social + 2.9% de Medicare, calculado sobre el 92.35% de la ganancia), más el impuesto sobre la renta normal. Puedes deducir la mitad del impuesto de trabajo por cuenta propia.</p>
               <p>En total, muchas veces suma entre <strong>25% y 30%</strong> de tu ganancia. El hábito más seguro: pasa esa parte a tus ahorros cada vez que te paguen.</p>
               <div class="callout"><strong>Encuentra tu número:</strong> la <a href="taxes.html#gig">calculadora de impuestos de trabajos extra</a> te dice cuánto apartar.</div>`,
      },
      {
        heading: "Deducciones: guarda recibos y anota tus millas",
        html: `<p>Pagas impuestos sobre la <strong>ganancia</strong>: ingresos menos gastos del negocio. Algunos comunes: materiales, la parte de negocio de tu teléfono, comisiones de las plataformas y equipo.</p>
               <p>Si manejas por trabajo, la <strong>tarifa estándar por milla del IRS</strong> es de 72.5¢ por milla de enero a junio de 2026 y de <strong>76¢</strong> desde el 1 de julio de 2026. Manejar 3,000 millas de negocio a 76¢ te deduce $2,280. Anota cada viaje (fecha, millas, motivo) en el momento; una app lo hace fácil.</p>`,
      },
      {
        heading: "Paga sobre la marcha",
        html: `<p>Si esperas deber <strong>$1,000 o más</strong>, el IRS espera <strong>pagos estimados trimestrales</strong>, que normalmente vencen en abril, junio, septiembre y enero. Saltarlos puede generar multas. Si también tienes un trabajo W-2, aumentar tu retención en el W-4 puede cubrirlo.</p>
               <p>Un trabajo extra también cuenta como ingreso del trabajo, así que puedes usarlo para aportar a una <strong>Roth IRA</strong>.</p>`,
      },
    ],
    quiz: [
      {
        q: "Ganaste $1,500 de un cliente en 2026 y no recibiste un 1099. ¿Debes impuestos por ese dinero?",
        choices: ["No, menos de $2,000 está libre de impuestos", "Sí, todo el ingreso por cuenta propia paga impuestos", "Solo si usaste una app de pago", "Solo si el cliente lo reporta"],
        why: "El límite de $2,000 solo decide si el negocio debe enviarte un 1099. Tú igual reportas todo tu ingreso por cuenta propia.",
      },
      {
        q: "¿Cuál es la tasa del impuesto de trabajo por cuenta propia sobre (el 92.35% de) tu ganancia?",
        choices: ["7.65%", "10%", "15.3%", "22%"],
        why: "15.3%: pagas la parte del empleado y la del empleador del Seguro Social (12.4%) y Medicare (2.9%).",
      },
      {
        q: "Manejaste 2,000 millas de negocio en agosto de 2026. ¿Cuál es tu deducción por millaje con la tarifa estándar del IRS?",
        choices: ["$580", "$1,450", "$1,520", "$2,000"],
        why: "2,000 millas × 76¢ (la tarifa desde el 1 de julio de 2026) = $1,520.",
      },
    ],
  },
  "bnpl-payday": {
    title: "Compra ahora, paga después y préstamos de día de pago",
    summary: "El dinero fácil al pagar puede salir caro muy rápido. Aprende a ver el precio real.",
    cards: [
      {
        heading: "Compra ahora, paga después",
        html: `<p>Los planes de "paga en 4" dividen una compra en cuatro pagos durante unas seis semanas, normalmente <strong>sin interés si pagas a tiempo</strong>. En la encuesta de la Reserva Federal sobre 2025, el <strong>16% de los adultos</strong> usó uno.</p>
               <p>El problema: el <strong>21% de los usuarios</strong> pagó un cargo por atraso o tuvo un cargo por sobregiro o pago rebotado. Los problemas fueron más comunes cuando se usó para comida o entregas de comida. Tener varios planes a la vez hace fácil perder la cuenta de lo que debes.</p>
               <p class="small muted">Fuente: Reserva Federal, Survey of Household Economics and Decisionmaking (datos de 2025).</p>`,
      },
      {
        heading: "Préstamos de día de pago (payday loans)",
        html: `<p>Un payday loan es un préstamo pequeño y corto que vence en tu próximo día de pago. Un cargo típico es de <strong>$15 por cada $100</strong> por dos semanas. Suena poco, pero la CFPB dice que equivale a un APR de <strong>casi 400%</strong>, contra cerca de 22% en la tarjeta de crédito promedio.</p>
               <p>La trampa es la <strong>renovación</strong> (rollover): si no puedes pagar, pagas otro cargo para mover la fecha de pago, una y otra vez, y sigues debiendo el monto completo.</p>`,
      },
      {
        heading: "Convierte cualquier cargo en un APR",
        html: `<p><strong>APR = cargo ÷ monto prestado × 365 ÷ días</strong></p>
               <p>Ejemplo: un cargo de $60 por un préstamo de $400 a 14 días: 60 ÷ 400 × 365 ÷ 14 ≈ <strong>391%</strong>.</p>
               <div class="callout"><strong>Pruébalo:</strong> compara préstamos en la <a href="credit.html#loancost">calculadora de cargo a APR</a>.</div>`,
      },
      {
        heading: "Mejores opciones cuando falta dinero",
        html: `<ul>
                 <li><strong>Tu fondo de emergencia</strong>: incluso $500 ahorrados te mantienen fuera de la mayoría de estas trampas.</li>
                 <li><strong>Préstamos alternativos de las cooperativas de crédito</strong> (payday alternative loans): préstamos pequeños con APR limitado al 28% (reglas de la NCUA).</li>
                 <li><strong>Pide</strong> a tu empleador un adelanto de sueldo, o a quien le debes un plan de pagos o un cambio de fecha.</li>
                 <li>Si usas compra ahora, paga después, úsalo para una compra planeada a la vez, con pago automático desde una cuenta que tenga el dinero.</li>
               </ul>`,
      },
    ],
    quiz: [
      {
        q: "Un prestamista de día de pago cobra $15 por cada $100 por dos semanas. ¿Qué APR es eso, aproximadamente?",
        choices: ["15%", "30%", "Cerca de 100%", "Casi 400%"],
        why: "15 ÷ 100 × 365 ÷ 14 ≈ 391%. Los plazos cortos hacen que cargos que parecen pequeños sean enormes al anualizarlos.",
      },
      {
        q: "¿Cuándo suele ser gratis un plan de \"paga en 4\"?",
        choices: ["Siempre", "Cuando haces todos los pagos a tiempo", "Solo en compras de más de $500", "Nunca"],
        why: "La mayoría de los planes de paga en 4 no cobran interés, pero los pagos atrasados pueden traer cargos por atraso y cargos por sobregiro de tu banco.",
      },
      {
        q: "¿Cuál es el principal peligro de renovar un payday loan?",
        choices: ["Baja tu tasa de interés", "Pagas un cargo nuevo cada vez y sigues debiendo el monto completo", "Es ilegal en todas partes", "Cierra tu cuenta bancaria"],
        why: "Cada renovación agrega otro cargo sin reducir lo que pediste prestado, así que los costos se acumulan rápido.",
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
