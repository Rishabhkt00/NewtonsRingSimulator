import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  FileText,
  ListOrdered,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';

export const TheoryAndLearning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'theory' | 'procedure' | 'quiz' | 'applications'>('theory');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: number]: number }>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  const quizQuestions = [
    {
      id: 1,
      question: "Why is the central spot dark in Newton's Rings viewed by reflected light?",
      options: [
        "Due to total internal reflection within the lens.",
        "Because the film thickness is zero, but reflection at the lower optically denser boundary introduces a phase change of π (Stokes' relation).",
        "Because monochromatic light cannot penetrate the contact area.",
        "Because of diffraction at the curved edge of the lens."
      ],
      correct: 1,
      explanation: "At the point of contact, film thickness t = 0. The ray reflected from the lower surface of the plano-convex lens undergoes no phase change (denser to rarer), while the ray reflected from the upper surface of the glass plate undergoes a phase change of π radians (rarer to denser). The net phase difference is π, resulting in destructive interference and a dark central spot."
    },
    {
      id: 2,
      question: "Why do the interference rings become progressively closer together as the ring order n increases?",
      options: [
        "Light intensity drops off with distance from the center.",
        "The radius of curvature decreases radially.",
        "Because the ring radius is proportional to √n, making dr/dn ∝ 1/√n.",
        "Microscope spherical aberration compresses outer rings."
      ],
      correct: 2,
      explanation: "Since r_n = √(nλR/μ), the derivative with respect to n is dr_n/dn = (1/2) · √(λR/(μn)) ∝ 1/√n. As ring order n increases, the radial spacing between successive rings diminishes, causing progressive crowding."
    },
    {
      id: 3,
      question: "What happens to the central spot when the plano-convex lens is raised vertically by a distance of λ/4?",
      options: [
        "The central spot disappears completely.",
        "The central spot changes from dark to bright.",
        "The rings expand outwards.",
        "The wavelength of the light shifts."
      ],
      correct: 1,
      explanation: "Raising the lens by d = λ/4 increases the optical path difference at the center by 2d = λ/2. This introduces an additional phase difference of π, which cancels the π phase change from reflection. The total phase difference becomes 2π (or 0), producing constructive interference (a bright central spot)."
    },
    {
      id: 4,
      question: "When a transparent liquid of refractive index μ is introduced between the lens and glass plate, the ring diameters:",
      options: [
        "Increase by a factor of μ.",
        "Remain unchanged.",
        "Decrease by a factor of 1/√μ.",
        "Increase by a factor of √μ."
      ],
      correct: 2,
      explanation: "In a medium of refractive index μ, the condition for dark rings is D_n² = 4nλR/μ, which gives D_n = 2√(nλR/μ). Hence, the diameter of any ring shrinks by a factor of 1/√μ compared to air."
    },
    {
      id: 5,
      question: "What is observed when monochromatic light is replaced with white light in Newton's Rings?",
      options: [
        "Only a few concentric colored rings around a dark center, which wash out into uniform white illumination at higher orders.",
        "An infinite series of sharp, brilliant rainbow rings.",
        "A bright central spot surrounded by alternating black and white rings.",
        "Complete destruction of interference fringes everywhere."
      ],
      correct: 0,
      explanation: "Because ring diameter depends on wavelength (D ∝ √λ), violet rings are smallest and red rings are largest for each order. Near the center, a few colored rings are seen. At higher orders, overlapping fringes from different visible wavelengths blend into uniform white light due to the short temporal coherence length of white light."
    },
    {
      id: 6,
      question: "How is Newton's Rings method used in optical workshops to test optical flatness of glass surfaces?",
      options: [
        "By measuring the focal length of the test plate.",
        "If the test surface is optically flat, fringes are perfectly circular and concentric; irregularities or imperfections distort fringes into topographical contour maps.",
        "By measuring the transmission absorption spectrum.",
        "By measuring Brewster's polarizing angle."
      ],
      correct: 1,
      explanation: "Newton's rings act as optical contour lines of equal film thickness. Any surface deviation on the order of a fraction of a wavelength (λ/10) causes visible bending and distortion of the circular fringes."
    }
  ];

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (submittedQuiz) return;
    setQuizAnswers({ ...quizAnswers, [qId]: optIdx });
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) score++;
    });
    return score;
  };

  return (
    <div className="w-full space-y-4 text-xs select-none">
      {/* Navigation Sub-tabs */}
      <div className="flex items-center space-x-2 p-2 rounded-xl bg-lab-900/90 border border-slate-800 font-mono">
        <button
          onClick={() => setActiveTab('theory')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
            activeTab === 'theory'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Physics Principles & Derivations</span>
        </button>

        <button
          onClick={() => setActiveTab('procedure')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
            activeTab === 'procedure'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Laboratory Procedure (8 Steps)</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
            activeTab === 'applications'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Industrial & Optical Applications</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
            activeTab === 'quiz'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Viva Voce Quiz</span>
        </button>
      </div>

      {/* 1. THEORY TAB */}
      {activeTab === 'theory' && (
        <div className="space-y-4">
          {/* Section 1: Thin-Film Interference & Geometry */}
          <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-sky-400 flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>1. Principle of Thin-Film Interference by Division of Amplitude</span>
            </h3>

            <p className="text-slate-300 leading-relaxed text-[13px]">
              Newton's rings are an interference pattern produced by the reflection of light between two optical surfaces: a spherical surface of large radius of curvature <strong className="text-sky-300">R</strong> and an adjacent optically flat glass plate. The thin film formed between them has variable thickness <strong className="text-emerald-300">t(r)</strong>, which is zero at the point of contact and increases symmetrically outwards with radial distance <strong className="text-slate-100">r</strong>.
            </p>

            {/* Geometric Derivation Card */}
            <div className="p-3.5 rounded-lg bg-lab-950 border border-sky-950/60 font-mono space-y-2">
              <span className="text-sky-300 font-bold block">
                Relation Between Film Thickness t and Radial Distance r:
              </span>
              <p className="text-slate-400 text-xs">
                From the geometry of a circle of radius R (curved surface of the plano-convex lens), by the intersecting chords theorem:
              </p>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-200">
                r² = t · (2R - t) ≈ 2R · t &nbsp; (since t &lt;&lt; R) <br />
                <strong className="text-emerald-400">t = r² / (2R) = D² / (8R)</strong>
              </div>
              <p className="text-slate-400 text-xs">
                Where <strong className="text-slate-200">D = 2r</strong> is the diameter of the circular ring at that thickness.
              </p>
            </div>
          </div>

          {/* Section 2: Path Difference & Stokes' Law */}
          <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>2. Optical Path Difference and Stokes' Phase Reversal</span>
            </h3>

            <p className="text-slate-300 leading-relaxed text-[13px]">
              For light of wavelength <strong className="text-sky-300">λ</strong> incident normally on the film of refractive index <strong className="text-cyan-300">μ</strong>, the geometric path difference between the ray reflected at the upper boundary (lens-film) and the ray reflected at the lower boundary (film-plate) is:
            </p>

            <div className="p-3 bg-lab-950 rounded border border-slate-800 font-mono text-slate-200 space-y-2">
              <div>
                Geometric Path Difference = 2μt
              </div>
              <div>
                According to <strong className="text-amber-400">Stokes' relations</strong>, when light reflects from the boundary of an optically denser medium (at the upper surface of the glass plate, since μ_plate &gt; μ_film), it undergoes a phase change of <strong className="text-amber-300">π radians</strong>, equivalent to an additional optical path difference of <strong className="text-amber-300">λ / 2</strong>.
              </div>
              <div className="pt-2 border-t border-slate-800 text-sky-300 font-bold">
                Total Effective Optical Path Difference: Δ = 2μt + λ/2
              </div>
            </div>
          </div>

          {/* Section 3: Conditions for Bright and Dark Rings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dark Rings (Destructive Interference) */}
            <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Condition for Dark Rings (Reflected Light)
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Destructive interference occurs when the path difference equals an odd multiple of λ/2:
              </p>
              <div className="p-2.5 bg-lab-950 rounded border border-sky-950/60 font-mono text-xs text-sky-200">
                2μt + λ/2 = (2n + 1) · (λ/2) <br />
                2μt = nλ <br />
                2μ(Dₙ² / 8R) = nλ <br />
                <strong className="text-sky-400 text-sm">Dₙ² = 4nλR / μ</strong>
              </div>
              <p className="text-slate-400 text-[11px]">
                Diameter of nth dark ring is proportional to <strong className="text-slate-200">√n</strong>:
                Dₙ ∝ √n. For n = 0 (at contact point t=0), D₀ = 0 (Dark Central Spot).
              </p>
            </div>

            {/* Bright Rings (Constructive Interference) */}
            <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Condition for Bright Rings (Reflected Light)
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Constructive interference occurs when the path difference equals an integral multiple of λ:
              </p>
              <div className="p-2.5 bg-lab-950 rounded border border-amber-950/60 font-mono text-xs text-amber-200">
                2μt + λ/2 = nλ <br />
                2μt = (2n - 1) · (λ/2) <br />
                2μ(Dₙ² / 8R) = (n - 1/2)λ <br />
                <strong className="text-amber-400 text-sm">Dₙ² = 4(n - 1/2)λR / μ</strong>
              </div>
              <p className="text-slate-400 text-[11px]">
                Bright rings alternate with dark rings, with radii proportional to <strong className="text-slate-200">√(n - 1/2)</strong>.
              </p>
            </div>
          </div>

          {/* Section 4: Determination of Wavelength and Refractive Index */}
          <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-3 font-mono">
            <h3 className="text-sm font-semibold text-slate-100 font-sans flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>3. Mathematical Formulae for Experimental Parameters</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-lab-950 rounded border border-slate-800">
                <span className="text-sky-300 font-bold block mb-1">Determination of Wavelength (λ):</span>
                <p className="text-slate-400 text-[11px] mb-2">
                  Subtracting the squared diameter of the nth ring from the (n+m)th ring eliminates the central contact error:
                </p>
                <div className="p-1.5 bg-slate-900 rounded text-sky-200">
                  D²ₙ₊ₘ - D²ₙ = (4(n+m)λR - 4nλR) / μ = 4mλR / μ <br />
                  <strong className="text-sky-400">λ = (D²ₙ₊ₘ - D²ₙ) · μ / (4mR)</strong>
                </div>
              </div>

              <div className="p-3 bg-lab-950 rounded border border-slate-800">
                <span className="text-cyan-300 font-bold block mb-1">Determination of Liquid Refractive Index (μ):</span>
                <p className="text-slate-400 text-[11px] mb-2">
                  Taking measurements for air (μ=1) and the liquid medium:
                </p>
                <div className="p-1.5 bg-slate-900 rounded text-cyan-200">
                  (D²ₙ₊ₘ - D²ₙ)_air = 4mλR <br />
                  (D'²ₙ₊ₘ - D'²ₙ)_liquid = 4mλR / μ <br />
                  <strong className="text-cyan-400">μ = (D²ₙ₊ₘ - D²ₙ)_air / (D'²ₙ₊ₘ - D'²ₙ)_liquid</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROCEDURE TAB */}
      {activeTab === 'procedure' && (
        <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-sky-400 flex items-center space-x-2">
            <ListOrdered className="w-4 h-4" />
            <span>Standard First-Year Engineering Laboratory Practical Procedure</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {[
              {
                step: 1,
                title: "Optical Cleaning and Setup Alignment",
                desc: "Clean the surfaces of the optically flat plane glass plate and the plano-convex lens using lens tissue. Place the glass plate on the base and gently position the curved surface of the plano-convex lens upon it."
              },
              {
                step: 2,
                title: "Monochromatic Illumination",
                desc: "Direct parallel monochromatic light from a sodium vapor lamp (λ = 589 nm) onto an inclined glass plate oriented at 45° to reflect the beam normally down onto the lens-plate system."
              },
              {
                step: 3,
                title: "Focusing the Travelling Microscope",
                desc: "Position the travelling microscope vertically over the arrangement. Adjust the rack-and-pinion focusing knob until sharp, distinct concentric circular rings with a dark center are resolved in the field of view."
              },
              {
                step: 4,
                title: "Crosswire Alignment and Range Traversal",
                desc: "Traverse the microscope horizontally to one extreme side (e.g., left of the center up to the 16th or 20th dark ring). Align the vertical crosswire tangentially with each selected dark ring."
              },
              {
                step: 5,
                title: "Recording Left Readings",
                desc: "Read the Main Scale Reading (MSR) and Vernier Scale Reading (VSR). Total reading = MSR + (VSR × LC). Move progressively inward, recording left readings for orders n = 16, 14, 12, 10, 8, 6, 4, 2."
              },
              {
                step: 6,
                title: "Crossing Center and Recording Right Readings",
                desc: "Continue traversing past the central dark spot to the opposite (right) side without reversing the screw direction (to avoid backlash error), and record right readings for corresponding ring orders."
              },
              {
                step: 7,
                title: "Computation of Diameters and Squared Diameters",
                desc: "Compute the ring diameter D = |R_Left - R_Right| for each order, and square each value to obtain D². Tabulate differences (D²_{n+m} - D²_n) for a constant interval m (typically m = 4 or 6)."
              },
              {
                step: 8,
                title: "Graphical Analysis and Physical Parameter Extraction",
                desc: "Plot a graph of D² against ring order n. Verify linearity and determine the slope S. Calculate experimental wavelength λ = (S · μ) / (4R), and compare with theoretical values to report percentage error."
              }
            ].map((st) => (
              <div key={st.step} className="p-3 rounded-lg bg-lab-950 border border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold flex items-center justify-center shrink-0">
                  {st.step}
                </span>
                <div>
                  <div className="font-semibold text-slate-100 mb-1">{st.title}</div>
                  <div className="text-slate-400 leading-relaxed font-sans text-xs">{st.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-2">
            <h4 className="font-bold text-sky-400 text-xs uppercase tracking-wider font-mono">
              1. Optical Surface Flatness & Lens Quality Testing
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              In optical manufacturing, reference test plates ("optical flats") are placed against finished glass surfaces to inspect flatness. Irregularities as small as a twentieth of a wavelength (λ/20 ≈ 25 nm) produce conspicuous distortion in fringe shape.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider font-mono">
              2. Precision Wavelength Metrology
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Because interference fringe spacing depends strictly on wavelength, measuring fringe diameters with a travelling microscope of calibrated radius of curvature provides a precise method for determining unknown monochromatic optical spectral lines.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-400 text-xs uppercase tracking-wider font-mono">
              3. Refractometry of Micro-Volume Liquids
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Introducing a single droplet of an unknown transparent chemical liquid into the film gap contracts the ring diameters by 1/√μ. Measuring the ratio of slopes between air and the liquid yields the exact refractive index of the liquid without requiring large sample volumes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-2">
            <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider font-mono">
              4. Anti-Reflective Coatings & Thin Film Metrology
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              The fundamental principle of destructive interference in thin films with a quarter-wavelength thickness (t = λ/4) forms the technological foundation for optical anti-reflective (AR) coatings used in camera lenses, eyeglasses, and solar photovoltaic cells.
            </p>
          </div>
        </div>
      )}

      {/* 4. VIVA VOCE QUIZ TAB */}
      {activeTab === 'quiz' && (
        <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
                ENGINEERING PHYSICS VIVA VOCE SELF-ASSESSMENT
              </h3>
            </div>

            {submittedQuiz && (
              <div className="font-mono text-xs px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                Score: {calculateScore()} / {quizQuestions.length} ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
              </div>
            )}
          </div>

          <div className="space-y-4">
            {quizQuestions.map((q, idx) => {
              const selectedOpt = quizAnswers[q.id];
              const isCorrect = selectedOpt === q.correct;

              return (
                <div key={q.id} className="p-3.5 rounded-lg bg-lab-950 border border-slate-800 space-y-2.5">
                  <div className="font-medium text-slate-200 text-xs">
                    Q{idx + 1}. {q.question}
                  </div>

                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800';

                      if (submittedQuiz) {
                        if (optIdx === q.correct) {
                          btnStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-600 font-semibold';
                        } else if (selectedOpt === optIdx) {
                          btnStyle = 'bg-rose-950/80 text-rose-300 border-rose-600 font-semibold';
                        }
                      } else if (selectedOpt === optIdx) {
                        btnStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submittedQuiz}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-2 rounded border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {submittedQuiz && optIdx === q.correct && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                          )}
                          {submittedQuiz && selectedOpt === optIdx && optIdx !== q.correct && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {submittedQuiz && (
                    <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
                      <strong className="text-sky-300 font-mono">Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            {submittedQuiz ? (
              <button
                onClick={() => {
                  setSubmittedQuiz(false);
                  setQuizAnswers({});
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-lg border border-slate-700"
              >
                Retake Quiz
              </button>
            ) : (
              <button
                onClick={() => setSubmittedQuiz(true)}
                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                className="px-5 py-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-md"
              >
                Submit Answers ({Object.keys(quizAnswers).length}/{quizQuestions.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
