"use client"
import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import { useRouter } from "next/navigation"

export default function Home() {
  const [selectedBot, setSelectedBot] = useState('all');
  const [leverage, setLeverage] = useState(1);
  const router = useRouter();
  const botsData = {
    '1ºAño': [2.7053185619112816,-2.684938627938189,-2.6454507939110252,2.6170296791978567,-2.6618565279403614,2.5752845774545405,2.6637095664768022,-2.6505955801472427,2.6939567949358105,2.5929207789336832],
    '2ºAño': [-2.6902760647464152,2.874962955414567,-2.64429034665291,2.5679239675294143,2.6524491102754153,-2.7383518936981743,-2.7724309871723833,2.661318212633306,-2.7138424282878932,2.5754725211238116,2.5749369954620445,2.618833175689772,-2.7088042724082126,-2.9518586613190343,2.785133626998985,2.675846778313762,2.595461487040121,2.5632185038398383],
    '3ºAño': [2.5639353712291086,-3.5109008471729433,3.0678262270647383,2.5729275115108248,-2.8374381860428017,2.580951331157668,-2.792963101504058,-3.0333620579257476,-2.6975932297963494,-2.664165055101752,2.8473787745550685,2.677564736665481],
    '4ºAño': [-2.979626535520318,2.635337100091894,2.587219255886677,-2.6585411511807657,2.5802374462751145,-2.716993778084689,2.5676481494625527,-2.83682711264004,-3.006900185882845,2.915722132147557,-2.7430666430196338,2.580590914788638,2.6212654101371036,2.7461062174250372],
    '5ºAño': [2.5761417117024417,-2.65150685804107,2.561190721349744,-2.77062880034549,2.609629208066244,2.7264683034356643,2.612191269259393,2.7467472159092634,-2.6718375798865046,2.671176882092522,2.727559326006214,2.7986687397990377,-2.75324792809923,2.8295116256561053]
  };

const calculateReturns = (trades, leverageMultiplier = 1, initialCapital = 100) => {
  // Asumimos: `trades` ya son porcentajes netos (comisiones aplicadas)
  const leveragedTrades = trades.map(t => t * leverageMultiplier);

  // Lineal (suma simple de % apalancados)
  const linearReturn = leveragedTrades.reduce((sum, pct) => sum + pct, 0);

  // Compuesto (factor acumulado)
  const compoundFactor = leveragedTrades.reduce((acc, pct) => acc * (1 + pct / 100), 1);
  const compoundReturnPct = (compoundFactor - 1) * 100;

  // Separar wins/losses
  const winningTrades = leveragedTrades.filter(t => t > 0);
  const losingTrades = leveragedTrades.filter(t => t < 0);

  const totalTrades = leveragedTrades.length;
  const winRate = totalTrades ? (winningTrades.length / totalTrades) * 100 : 0;

  const sumWins = winningTrades.reduce((s, v) => s + v, 0);   // suma de % positivos
  const sumLosses = losingTrades.reduce((s, v) => s + v, 0);  // suma de % negativos (valor negativo)

  const avgWin = winningTrades.length ? sumWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length ? sumLosses / losingTrades.length : 0;

  // Profit factor: grossProfit / grossLoss (usar valores absolutos)
  const profitFactor = Math.abs(sumLosses) > 0
    ? Math.abs(sumWins) / Math.abs(sumLosses)
    : (sumWins > 0 ? Infinity : 0);

  const largestWin = winningTrades.length ? Math.max(...winningTrades) : 0;
  const largestLoss = losingTrades.length ? Math.min(...losingTrades) : 0;

  // Simulación de capital y drawdown usando initialCapital consistente
  let peak = initialCapital;
  let maxDrawdown = 0;
  let currentCapital = initialCapital;

  for (const pct of leveragedTrades) {
    // Si pct <= -100, interpretamos liquidación/total loss (capital a 0)
    if (pct <= -100) {
      currentCapital = 0;
      maxDrawdown = 100;
      break;
    }
    currentCapital = currentCapital * (1 + pct / 100);
    if (currentCapital > peak) peak = currentCapital;
    const drawdown = ((peak - currentCapital) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    if (!isFinite(currentCapital) || currentCapital <= 0) {
      currentCapital = Math.max(0, currentCapital);
      break;
    }
  }

  return {
    linearReturn,
    compoundReturnPct,
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    largestWin,
    largestLoss,
    maxDrawdown,
    finalCapital: currentCapital,
    initialCapital
  };
};

  const results = useMemo(() => ({

    '1ºAño': calculateReturns(botsData['1ºAño'], leverage),
    '2ºAño': calculateReturns(botsData['2ºAño'], leverage),
    '3ºAño': calculateReturns(botsData['3ºAño'], leverage),
    '4ºAño': calculateReturns(botsData['4ºAño'], leverage),
    '5ºAño': calculateReturns(botsData['5ºAño'], leverage)
  }), [leverage]);

  const getBotData = () => {
    if (selectedBot === 'all') {
      return Object.entries(results);
    }
    return [[selectedBot, results[selectedBot]]];
  };

  const getStatusColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusBg = (value) => {
    if (value > 0) return 'bg-green-50';
    if (value < 0) return 'bg-red-50';
    return 'bg-gray-50';
  };
 
   const irAGraphic = () => {
    router.push("/graficas");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Análisis Detallado de Bots de Trading</h1>
          <p className="text-slate-600">Comparación de rendimientos lineales vs compuestos con apalancamiento</p>
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">⚡ Nivel de Apalancamiento</h3>
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3, 5, 10].map(lev => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  leverage === lev 
                    ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                    : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
                }`}
              >
                x{lev}
              </button>
            ))}
          </div>
          {leverage > 1 && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">
                <strong>⚠️ Advertencia:</strong> Con apalancamiento x{leverage}, cada ganancia y pérdida se multiplica por {leverage}. El riesgo aumenta exponencialmente.
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 sm:mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedBot('all')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
              selectedBot === 'all' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-slate-700 hover:bg-blue-50'
            }`}
          >
            Ver Todos
          </button>
          {Object.keys(results).map(bot => (
            <button
              key={bot}
              onClick={() => setSelectedBot(bot)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                selectedBot === bot 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-slate-700 hover:bg-blue-50'
              }`}
            >
              {bot}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:gap-6">
          {getBotData().map(([botName, data]) => (
            <div key={botName} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                    {botName}
                  </h2>
                  {leverage > 1 && (
                    <span className="bg-purple-500 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-white self-start sm:ml-auto">
                      Apalancamiento x{leverage}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className={`${getStatusBg(data.linearReturn)} rounded-lg p-6 border-2 border-slate-200`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-slate-600" />
                      <h3 className="font-semibold text-slate-700">Rendimiento Lineal</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Suma simple de todos los profitPct</p>
                    <div className={`text-4xl font-bold ${getStatusColor(data.linearReturn)}`}>
                      {data.linearReturn > 0 ? '+' : ''}{data.linearReturn.toFixed(2)}%
                    </div>
                  </div>

                  <div className={`${getStatusBg(data.compoundReturnPct)} rounded-lg p-6 border-2 border-slate-200`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-slate-600" />
                      <h3 className="font-semibold text-slate-700">Rendimiento Compuesto</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Multiplicación acumulativa (reinversión)</p>
                    <div className={`text-4xl font-bold ${getStatusColor(data.compoundReturnPct)}`}>
                      {data.compoundReturnPct > 0 ? '+' : ''}{data.compoundReturnPct.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Estadísticas Detalladas
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Total de Operaciones</p>
                      <p className="text-2xl font-bold text-slate-800">{data.totalTrades}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">Win Rate</p>
                      <p className="text-2xl font-bold text-blue-600">{data.winRate.toFixed(1)}%</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {data.winningTrades}W / {data.losingTrades}L
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">Profit Factor</p>
                      <p className={`text-2xl font-bold ${data.profitFactor > 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.profitFactor.toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">Ganancia Promedio</p>
                      <p className="text-xl font-bold text-green-600">+{data.avgWin.toFixed(2)}%</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">Pérdida Promedio</p>
                      <p className="text-xl font-bold text-red-600">{data.avgLoss.toFixed(2)}%</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">Mejor / Peor Trade</p>
                      <p className="text-sm font-semibold">
                        <span className="text-green-600">+{data.largestWin.toFixed(2)}%</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-red-600">{data.largestLoss.toFixed(2)}%</span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">Drawdown Máximo</p>
                      <p className="text-xl font-bold text-orange-600">{data.maxDrawdown.toFixed(2)}%</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">Capital Final ($100 inicial)</p>
                      <p className={`text-xl font-bold ${data.finalCapital >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                        ${data.finalCapital.toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">ROI Total</p>
                      <p className={`text-xl font-bold ${data.finalCapital >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {((data.finalCapital - 100) / 100 * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="text-sm text-slate-700">
                    <strong>Diferencia entre métodos:</strong> {Math.abs(data.compoundReturnPct - data.linearReturn).toFixed(2)}%
                    {data.compoundReturnPct > data.linearReturn ? ' (el compuesto es mayor)' : ' (el lineal es mayor)'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">📊 Resumen Comparativo {leverage > 1 ? `(x${leverage})` : ''}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-3 text-slate-700">Bot</th>
                  <th className="text-right p-3 text-slate-700">Lineal</th>
                  <th className="text-right p-3 text-slate-700">Compuesto</th>
                  <th className="text-right p-3 text-slate-700">Capital Final</th>
                  <th className="text-right p-3 text-slate-700">Drawdown</th>
                  <th className="text-right p-3 text-slate-700">Win Rate</th>
                  <th className="text-right p-3 text-slate-700">Profit Factor</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([botName, data]) => (
                  <tr key={botName} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{botName}</td>
                    <td className={`text-right p-3 font-bold ${getStatusColor(data.linearReturn)}`}>
                      {data.linearReturn > 0 ? '+' : ''}{data.linearReturn.toFixed(2)}%
                    </td>
                    <td className={`text-right p-3 font-bold ${getStatusColor(data.compoundReturnPct)}`}>
                      {data.compoundReturnPct > 0 ? '+' : ''}{data.compoundReturnPct.toFixed(2)}%
                    </td>
                    <td className={`text-right p-3 font-semibold ${data.finalCapital >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                      ${data.finalCapital.toFixed(2)}
                    </td>
                    <td className="text-right p-3 text-orange-600 font-semibold">
                      {data.maxDrawdown.toFixed(2)}%
                    </td>
                    <td className="text-right p-3 text-slate-600">{data.winRate.toFixed(1)}%</td>
                    <td className={`text-right p-3 font-semibold ${data.profitFactor > 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.profitFactor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <h4 className="font-bold text-yellow-800 mb-2">⚠️ Nota Importante</h4>
          <p className="text-sm text-yellow-700 mb-2">
            <strong>Rendimiento Lineal:</strong> Suma simple de porcentajes. Asume que cada trade se hace con el mismo capital fijo.
          </p>
          <p className="text-sm text-yellow-700">
            <strong>Rendimiento Compuesto:</strong> Multiplica los retornos. Asume que reinviertes las ganancias (o pierdes sobre capital acumulado). 
            Este es el método más realista en trading con capital variable.
          </p>
        </div>
         <button

                onClick={irAGraphic}
                className={`px-6 py-3 rounded-lg font-bold bg-purple-600 text-white shadow-lg  scale-100 mt-6 transition-all duration-300 hover:scale-110 justify-center mx-auto flex items-center gap-2` }
              >
                📊 Ver Gráficas
              </button>
      </div>
    </div>
  );
};


