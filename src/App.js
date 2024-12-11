import React, { useState, useRef } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { Send, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// PDF Document Component


// Color scheme
const colors = {
  primary: '#4F46E5',    // Indigo/Blue
  secondary: '#FF4785',  // Pink/Rose
  tertiary: '#F59E0B',   // Amber
  quaternary: '#10B981', // Emerald
  background: '#000000', // Pure black
  cardBg: '#000000',     // Black
  border: '#1a1a1a',     // Dark border
  text: '#E2E8F0',       // Bright text
  subtext: '#64748B',    // Brighter subtext
  gridLines: '#1a1a1a',  // Dark grid lines
  chartTitle: '#E2E8F0', // Bright white for titles
  chartSubtitle: '#64748B' // Blue-gray for subtitles
};

// Chart templates with consistent styling
const ChartTemplates = {
  area: ({ data, title, subtitle, config }) => (
    <div className="p-6 pt-0">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            {config.areas.map((area, index) => (
              <linearGradient key={`gradient-${area.dataKey}`} id={`color${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={area.color} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: colors.subtext }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.subtext }} />
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLines} vertical={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text
            }}
          />
          {config.areas.map((area, index) => (
            <Area 
              key={area.dataKey}
              type="monotone" 
              dataKey={area.dataKey} 
              stackId="1"
              stroke={area.color}
              fill={`url(#color${area.dataKey})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  ),

  bar: ({ data, title, subtitle, config }) => (
    <div className="p-6 pt-0">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: colors.subtext }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.subtext }} />
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLines} vertical={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text
            }}
          />
          {config.bars.map((bar, index) => (
            <Bar 
              key={bar.dataKey}
              dataKey={bar.dataKey} 
              fill={bar.color} 
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  ),

  pie: ({ data, title, subtitle, config }) => {
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + 20;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      const textAnchor = Math.cos(-midAngle * RADIAN) >= 0 ? 'start' : 'end';

      return (
        <text x={x} y={y} fill={colors.text} textAnchor={textAnchor} dominantBaseline="central" fontSize="12">
          {name}
        </text>
      );
    };

    return (
      <div className="p-6 pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={config.valueKey}
              nameKey={config.nameKey}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={[colors.primary, colors.secondary, colors.tertiary, colors.quaternary][index % 4]}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                color: colors.text
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  },

  scatter: ({ data, title, subtitle, config }) => (
    <div className="p-6 pt-0">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLines} vertical={false} />
          <XAxis 
            type="number" 
            dataKey={config.xAxis} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.subtext }}
          />
          <YAxis 
            type="number" 
            dataKey={config.yAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.subtext }}
          />
          <ZAxis type="number" dataKey={config.zAxis} range={[60, 400]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text
            }}
          />
          <Scatter data={data} fill={colors.primary} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
};

const ChartContainer = ({ chartData }) => {
  if (!chartData) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-black overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium" style={{ color: colors.chartTitle }}>Awaiting Data</h3>
          <p className="text-sm" style={{ color: colors.chartSubtitle }}>Chat with the AI to generate visualizations</p>
        </div>
        <div className="p-6 pt-0 h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No data visualization yet</p>
        </div>
      </div>
    );
  }

  const Template = ChartTemplates[chartData.type];
  
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-black overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-medium" style={{ color: colors.chartTitle }}>{chartData.title}</h3>
        <p className="text-sm" style={{ color: colors.chartSubtitle }}>{chartData.subtitle}</p>
      </div>
      {Template && <Template {...chartData} />}
      {chartData.footer && (
        <div className="px-6 pb-6">
          <div style={{ color: colors.chartSubtitle }}>{chartData.footer}</div>
        </div>
      )}
    </div>
  );
};
// Separate DownloadButton component
const DownloadButton = ({ charts }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const padding = 10;
    const width = pdf.internal.pageSize.getWidth() - (2 * padding);
    const height = (width * 0.75);

    try {
      // Capture each chart
      for (let i = 0; i < 4; i++) {
        const chartElement = document.getElementById(`chart-${i}`);
        if (chartElement) {
          const canvas = await html2canvas(chartElement, {
            backgroundColor: '#000000',
            scale: 2,
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          if (i > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(
            imgData,
            'PNG',
            padding,
            padding,
            width,
            height,
            `chart-${i}`,
            'FAST'
          );

          const chartData = Object.values(charts)[i];
          if (chartData?.title) {
            pdf.setFontSize(16);
            pdf.setTextColor(255, 255, 255);
            pdf.text(chartData.title, padding, height + (padding * 2));
          }
          
          if (chartData?.subtitle) {
            pdf.setFontSize(12);
            pdf.setTextColor(100, 116, 139);
            pdf.text(chartData.subtitle, padding, height + (padding * 3));
          }
        }
      }
      
      pdf.save('dashboard-charts.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating || !Object.values(charts).some(chart => chart)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
    >
      <Download className="w-5 h-5" />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </button>
  );
};

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [charts, setCharts] = useState({
    area: null,
    bar: null,
    pie: null,
    scatter: null
  });
  const chatContainerRef = useRef(null);

  const mockLLMCall = async (message) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const nextChart = !charts.area ? 'area' 
                   : !charts.bar ? 'bar'
                   : !charts.pie ? 'pie'
                   : !charts.scatter ? 'scatter'
                   : null;

    const chartConfigs = {
      area: {
        type: 'area',
        title: 'Area Chart Analysis',
        subtitle: 'Trend Analysis',
        data: [
          { name: 'Jan', value1: 100, value2: 200 },
          { name: 'Feb', value1: 120, value2: 220 },
          { name: 'Mar', value1: 140, value2: 240 },
        ],
        config: {
          areas: [
            { dataKey: 'value1', color: '#4F46E5' },
            { dataKey: 'value2', color: '#FF4785' }
          ]
        }
      },
      bar: {
        type: 'bar',
        title: 'Bar Chart Analysis',
        subtitle: 'Comparison View',
        data: [
          { name: 'A', value1: 100, value2: 200 },
          { name: 'B', value1: 120, value2: 220 },
          { name: 'C', value1: 140, value2: 240 },
        ],
        config: {
          bars: [
            { dataKey: 'value1', color: '#4F46E5' },
            { dataKey: 'value2', color: '#FF4785' }
          ]
        }
      },
      pie: {
        type: 'pie',
        title: 'Pie Chart Analysis',
        subtitle: 'Distribution View',
        data: [
          { name: 'A', value: 400 },
          { name: 'B', value: 300 },
          { name: 'C', value: 200 },
          { name: 'D', value: 100 }
        ],
        config: {
          nameKey: 'name',
          valueKey: 'value'
        }
      },
      scatter: {
        type: 'scatter',
        title: 'Scatter Plot Analysis',
        subtitle: 'Correlation View',
        data: [
          { x: 100, y: 200, z: 200 },
          { x: 120, y: 100, z: 260 },
          { x: 170, y: 300, z: 400 },
        ],
        config: {
          xAxis: 'x',
          yAxis: 'y',
          zAxis: 'z'
        }
      }
    };

    return {
      message: `Generated ${nextChart} chart for your data.`,
      chart: nextChart ? chartConfigs[nextChart] : null
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
    setInputMessage('');

    try {
      const response = await mockLLMCall(inputMessage);
      
      if (response.chart) {
        const chartType = response.chart.type;
        setCharts(prev => ({
          ...prev,
          [chartType]: response.chart
        }));
      }

      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: response.message 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        type: 'system', 
        content: 'Error processing request' 
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-black">
<div className="w-full h-16 border-b border-[#1a1a1a] flex items-center justify-between px-6">
  <DownloadButton charts={charts} />
  <img src="/logo.png" alt="Logo" className="h-8 md:h-8" />
</div>

      <div className="flex">
        {/* Chat Panel */}
        <div className="w-80 h-[calc(100vh-4rem)] border-r border-[#1a1a1a]">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[#1a1a1a]">
              <h2 className="text-lg font-medium text-slate-200">Chat</h2>
            </div>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${
                    message.type === 'user' 
                      ? 'ml-auto bg-blue-500 text-white' 
                      : message.type === 'system'
                      ? 'mx-auto bg-gray-800 text-gray-300'
                      : 'bg-gray-800 text-gray-300'
                  } p-3 rounded-lg max-w-[80%]`}
                >
                  {message.content}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Type a message..."
                />
                <button 
                  onClick={sendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
          <div id="chart-0">
            <ChartContainer chartData={charts.area} />
          </div>
          <div id="chart-1">
            <ChartContainer chartData={charts.bar} />
          </div>
          <div id="chart-2">
            <ChartContainer chartData={charts.pie} />
          </div>
          <div id="chart-3">
            <ChartContainer chartData={charts.scatter} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;