/**
 * SceneRenderer.jsx
 *
 * Renderiza texto narrativo do nó Twine com markdown
 * Exibe personagens com avatares/ícones
 * Animações de transição entre cenas
 *
 * Props:
 * - sceneData: { id, title, text, tags, puzzle }
 * - onChoiceSelect: (choiceId) => void
 * - inventory: []
 * - isLoading: boolean
 */

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";

const SceneRenderer = ({
  sceneData,
  onChoiceSelect,
  inventory = [],
  isLoading,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Disparar animação ao mudar de cena
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [sceneData?.id]);

  if (!sceneData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          {sceneData.title || "Sem título"}
        </h1>
        {sceneData.tags && sceneData.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {sceneData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Conteúdo principal */}
      <main
        className={`flex-1 mb-8 transition-all duration-300 ${
          isAnimating ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* Texto narrativo */}
        <article className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="prose prose-sm md:prose max-w-none text-lg leading-relaxed text-slate-700">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="mb-4 last:mb-0" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-slate-900" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic text-slate-600" {...props} />
                ),
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-2xl font-bold mb-4 text-slate-800"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-xl font-bold mb-3 text-slate-800"
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-blue-400 pl-4 py-2 italic text-slate-600 my-4"
                    {...props}
                  />
                ),
              }}
            >
              {sceneData.text}
            </ReactMarkdown>
          </div>
        </article>

        {/* Puzzle se existir */}
        {sceneData.puzzle && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <p className="text-yellow-800 font-semibold">
              🧩 Puzzle: {sceneData.puzzle.title || "Desafio"}
            </p>
            <p className="text-yellow-700 text-sm mt-2">
              {sceneData.puzzle.description}
            </p>
          </div>
        )}

        {/* Inventário compacto */}
        {inventory && inventory.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
            <p className="text-blue-800 font-semibold mb-2">
              🎒 Inventário ({inventory.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {inventory.map((item) => (
                <span
                  key={item.id}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                  title={item.description}
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer com mensagem */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>Processando...</span>
        </div>
      )}
    </div>
  );
};

SceneRenderer.propTypes = {
  sceneData: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    text: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    puzzle: PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
    }),
  }),
  onChoiceSelect: PropTypes.func,
  inventory: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    }),
  ),
  isLoading: PropTypes.bool,
};

export default SceneRenderer;
