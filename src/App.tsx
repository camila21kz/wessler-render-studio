// @ts-nocheck
import React, { useState, useRef } from 'react';
import './App.css';

// 🔑 COLE A SUA CHAVE DE API AQUI ENTRE AS ASPAS:
const API_KEY = "AIzaSyA5DzuvczS9G2y14mKp-W9U9v_Ow9eNwPc";

export default function App() {
  const [selectedRatio, setSelectedRatio] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [materialsText, setMaterialsText] = useState('');
  const [moodText, setMoodText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ratios = [
    { label: 'Quadrado 1:1', value: '1:1' },
    { label: 'Paisagem 16:9', value: '16:9' },
    { label: 'Retrato 9:16', value: '9:16' },
    { label: 'Paisagem 4:3', value: '4:3' },
    { label: 'Retrato 3:4', value: '3:4' }
  ];

  const handleReset = () => {
    setSelectedRatio(null);
    setUploadedImagePreview(null);
    setMaterialsText('');
    setMoodText('');
    setGeneratedImages([]);
    setFullscreenImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedRatio || !uploadedImagePreview) {
      alert("Por favor, anexe um print e escolha a proporção!");
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    const hiddenPrompt = "Não altere a geometria da imagem. Não altere o ângulo da imagem. Transforme este print em imagem realista.";
    const finalPrompt = `Materiais: ${materialsText}. Clima: ${moodText}. Regras: ${hiddenPrompt}`;

    try {
      const base64Image = uploadedImagePreview.split(',')[1];

      // Conexão real com a IA do Google
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: finalPrompt,
              image: {
                bytesBase64Encoded: base64Image
              }
            }
          ],
          parameters: {
            sampleCount: 4,
            aspectRatio: selectedRatio
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com a IA.');
      }

      const data = await response.json();
      
      if (data && data.predictions) {
        const newImages = data.predictions.map(pred => `data:image/png;base64,${pred.bytesBase64Encoded}`);
        setGeneratedImages(newImages);
      } else {
        throw new Error('Nenhuma imagem retornada.');
      }

    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Houve um erro de conexão com os servidores do Google.");
      
      setGeneratedImages([
        'https://placehold.co/800x600/FFCCCC/990000?text=Erro+de+Conexão+1',
        'https://placehold.co/800x600/FFCCCC/990000?text=Erro+de+Conexão+2',
        'https://placehold.co/800x600/FFCCCC/990000?text=Erro+de+Conexão+3',
        'https://placehold.co/800x600/FFCCCC/990000?text=Erro+de+Conexão+4',
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ fontFamily: '"DINPro", sans-serif', backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '40px', color: '#333' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/logo.png" alt="Wessler Render Studio Logo" style={{ width: '80px', height: 'auto', marginBottom: '16px' }} />
        <h1 style={{ fontWeight: 'normal', letterSpacing: '2px', margin: '0' }}>Wessler Render Studio</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>Transforme prints do Archicad em renderizações realistas</p>
        
        {(uploadedImagePreview || materialsText || moodText || selectedRatio || generatedImages.length > 0) && (
          <button onClick={handleReset} style={{ position: 'absolute', top: 0, right: 0, padding: '8px 16px', backgroundColor: '#FF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            X Limpar Tudo
          </button>
        )}
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />

        <div onClick={() => fileInputRef.current?.click()} style={{ border: uploadedImagePreview ? 'none' : '2px dashed #CCC', padding: uploadedImagePreview ? '0' : '60px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#FAFAFA', overflow: 'hidden', boxShadow: uploadedImagePreview ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}>
          {uploadedImagePreview ? (
            <div style={{ position: 'relative' }}>
              <img src={uploadedImagePreview} alt="Print do Projeto" style={{ width: '100%', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '14px' }}>Trocar Imagem</div>
            </div>
          ) : (
            <p style={{ fontSize: '18px', color: '#888' }}>+ Clique aqui para procurar o print do projeto no seu computador</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Descrição dos materiais:</label>
            <textarea value={materialsText} onChange={(e) => setMaterialsText(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #CCC', minHeight: '80px', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Descrição do clima e mood:</label>
            <textarea value={moodText} onChange={(e) => setMoodText(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #CCC', minHeight: '80px', fontFamily: 'inherit' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Escolha a proporção:</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {ratios.map((ratio) => (
              <button key={ratio.value} onClick={() => setSelectedRatio(ratio.value)} style={{ padding: '10px 16px', borderRadius: '4px', border: selectedRatio === ratio.value ? '2px solid #000' : '1px solid #CCC', backgroundColor: selectedRatio === ratio.value ? '#F0F0F0' : '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={!selectedRatio || isGenerating} style={{ padding: '16px', backgroundColor: selectedRatio ? (isGenerating ? '#666' : '#000') : '#CCC', color: '#FFF', border: 'none', borderRadius: '4px', fontSize: '18px', cursor: (!selectedRatio || isGenerating) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '16px', transition: '0.3s' }}>
          {isGenerating ? 'Enviando para o Google (pode levar alguns segundos)...' : (selectedRatio ? 'Gerar Render' : 'Escolha uma proporção primeiro')}
        </button>

        {generatedImages.length > 0 && (
          <div style={{ marginTop: '32px', borderTop: '1px solid #EEE', paddingTop: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Resultados:</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {generatedImages.map((imgUrl, index) => (
                <img key={index} src={imgUrl} alt={`Render ${index + 1}`} onClick={() => setFullscreenImage(imgUrl)} style={{ width: '100%', borderRadius: '8px', border: '1px solid #CCC', cursor: 'zoom-in', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              ))}
            </div>
          </div>
        )}

      </div>

      {fullscreenImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <button onClick={() => setFullscreenImage(null)} style={{ position: 'absolute', top: '20px', right: '40px', background: 'none', border: 'none', color: '#FFF', fontSize: '40px', cursor: 'pointer' }}>&times;</button>
          <img src={fullscreenImage} alt="Render Ampliado" style={{ maxHeight: '75vh', maxWidth: '90vw', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
          <a href={fullscreenImage} download="meu-render-wessler.png" style={{ marginTop: '24px', padding: '16px 32px', backgroundColor: '#FFF', color: '#000', textDecoration: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', fontFamily: 'inherit' }}>↓ Fazer Download</a>
        </div>
      )}

    </div>
  );
}
