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
      alert("Por favor, anexe um print do Archicad e escolha a proporção!");
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    // Aqui juntamos todas as suas regras
    const hiddenPrompt = "Não altere a geometria da imagem. Não altere o ângulo da imagem. Transforme este print em imagem realista.";
    const finalPrompt = `Materiais: ${materialsText}. Clima: ${moodText}. Regras: ${hiddenPrompt}`;
    
    // TRUQUE PARA A VERCEL: Lendo a chave para não dar erro na publicação
    console.log("Conectando com a chave de tamanho:", API_KEY.length);

    try {
      // 1. O código "limpa" a sua imagem para o formato puro que o Google entende (base64)
      const base64Image = uploadedImagePreview.split(',')[1];

      // 2. A função FETCH faz a ligação direta com a Inteligência Artificial
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagegen-001:predict?key=${API_KEY}`, {
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
            sampleCount: 4, // Pedindo as 4 opções de render
            aspectRatio: selectedRatio
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com os servidores do Google.');
      }

      const data = await response.json();
      
      // 3. Recebendo as imagens devolvidas pela IA e jogando na sua tela
      if (data && data.predictions) {
        const newImages = data.predictions.map((pred: any) => `data:image/png;base64,${pred.bytesBase64Encoded}`);
        setGeneratedImages(newImages);
      } else {
        throw new Error('Nenhuma imagem retornada.');
      }

    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Ops! O navegador bloqueou a conexão ou a API falhou. Verifique o console.");
      
      // Sistema de segurança: se a internet ou o Google falharem, ele não quebra o seu site
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
              <img src={uploadedImagePreview}
