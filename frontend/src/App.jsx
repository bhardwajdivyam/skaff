import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  OrbitControls,
  Text,
  Sparkles,
  MeshReflectorMaterial,
  ContactShadows,
  QuadraticBezierLine,
} from "@react-three/drei";

function App() {
  const [resume, setResume] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [graphData, setGraphData] = useState({ nodes: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasContainerRef = useRef(null);
  // 1️⃣ ADD NEW STATE
  const [pdfFile, setPdfFile] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [demoRoleOverride, setDemoRoleOverride] = useState(null);
  const [savedCities, setSavedCities] = useState([]);
  const [careerPath, setCareerPath] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // interviewer Compare Mode States
  const [compareMode, setCompareMode] = useState(false);
  const [compareInput, setCompareInput] = useState("");
  const [compareGraphData, setCompareGraphData] = useState({ nodes: [] });
  const [selectedRole, setSelectedRole] = useState("");
  const [repoLimit, setRepoLimit] = useState(10);
  // Search/filter state for buildings
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  // Minimal interviewer Compare Analyze
  const analyzeCompare = async () => {
    if (!compareInput) return;
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_input: compareInput, repo_limit: repoLimit }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Compare failed");

      const languages = data?.district?.languages || [];
      const libraries = data?.district?.libraries || [];

      const nodes = [
        ...languages.map(l => ({ id: l.name, type: "language", bytes: l.bytes || 1, percentage: l.percentage || null })),
        ...libraries.map(l => ({ id: l.name, type: "library", bytes: 1 }))
      ];

      setCompareGraphData({ nodes });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // 1️⃣ ADD STATE FOR EXPLANATION
  const [showWhy, setShowWhy] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiConfidence, setAiConfidence] = useState(null);
  const [whyLoading, setWhyLoading] = useState(false);
  // GEMINI-powered compare insight
  const fetchCompareInsight = async (stronger, aSkills, bSkills) => {
    try {
      setWhyLoading(true);
      const res = await fetch("http://127.0.0.1:8000/compare-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stronger,
          candidateA: aSkills,
          candidateB: bSkills,
          role: selectedRole || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Insight failed");

      setAiExplanation(data.explanation || "No explanation generated.");
      setAiConfidence(data.confidence || null);
    } catch (err) {
      setAiExplanation("Unable to generate AI reasoning.");
    } finally {
      setWhyLoading(false);
    }
  };
  const dropdownRef = useRef(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [session]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user) return;

      const { data } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) setSavedCities(data);
    };

    fetchHistory();
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);
  // 1️⃣ ADD EXPORT FUNCTION
  const exportImage = () => {
    const canvas = canvasContainerRef.current?.querySelector("canvas");
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "skaff-skill-city.png";
    link.click();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };
  // 1️⃣ ADD MOBILE DETECTION
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;


  function FloatingBuilding({ children, floatIntensity = 0.3 }) {
    const ref = useRef();

    useFrame(({ clock }) => {
      if (ref.current) {
        ref.current.position.y =
          ref.current.userData.baseY +
          Math.sin(clock.elapsedTime * 1.2) * floatIntensity;
      }
    });

    return (
      <group
        ref={ref}
        onUpdate={(self) => {
          self.userData.baseY = self.position.y;
        }}
      >
        {children}
      </group>
    );
  }

  function RotatingLabel({ position, children }) {
  function AnimatedEdge({ start, end, mid, active, label }) {
  const lineRef = useRef();
  const labelRef = useRef();

  useFrame(({ clock }) => {
    if (lineRef.current?.material) {
      const pulse = 0.6 + Math.sin(clock.elapsedTime * 3) * 0.3;
      lineRef.current.material.opacity = active ? pulse : 0.4;
    }

    if (labelRef.current) {
      labelRef.current.rotation.y += 0.002;
    }
  });

  return (
    <>
      <QuadraticBezierLine
        ref={lineRef}
        start={start}
        end={end}
        mid={mid}
        color={active ? "#22d3ee" : "#60a5fa"}
        lineWidth={active ? 3 : 2}
        transparent
        opacity={0.6}
      />

      <group position={[(start[0] + end[0]) / 2, mid[1], (start[2] + end[2]) / 2]}>
        <Text
          ref={labelRef}
          fontSize={0.8}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </>
  );
}
    const ref = useRef();

    useFrame((_, delta) => {
      if (ref.current) {
        ref.current.rotation.y += delta * 0.4;
      }
    });

    return (
      <group position={position}>
        <group ref={ref}>
          {children}
        </group>
      </group>
    );
  }

  const analyze = async () => {
    if (!inputValue && !resume) return;

    try {
      setLoading(true);
      setError(null);
      setGraphData({ nodes: [] });

      const trimmedInput = inputValue.trim();
      const trimmedResume = resume.trim();

      if (!trimmedInput && !trimmedResume) {
        setError("GitHub username or repo URL is required.");
        setLoading(false);
        return;
      }

      let payload = {
        github_input: trimmedInput || null,
        text: trimmedResume || null,
        repo_limit: repoLimit
      };

      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Server error occurred");
      }

      if (data?.career_recommendation) {
        setCareerPath(data.career_recommendation);
      }

      // If backend provides full graph model, use it directly
      if (data?.graph?.nodes && data.graph.nodes.length > 0) {
        setGraphData({
          nodes: data.graph.nodes
        });

        if (session?.user) {
          await supabase.from("analyses").insert([
            {
              user_id: session.user.id,
              input_type: trimmedInput ? "github" : "resume",
              input_value: trimmedInput || "resume-upload",
              result_json: { nodes: data.graph.nodes }
            }
          ]);
        }

        setLoading(false);
        return;
      }

      if (data?.district) {
        const coreNode = {
          id: data.district.core?.name,
          type: "core",
        };

        const allLanguages = data?.district?.languages || [];

        // Fallback: ensure at least one core node exists
        if (!allLanguages.length) {
          setGraphData({
            nodes: [
              {
                id: data?.district?.core?.name || "General",
                type: "core",
                bytes: 100
              }
            ],
          });
          setLoading(false);
          return;
        }

        // Keep top 6 languages, group rest as "Other"
        const primaryLanguages = allLanguages.slice(0, 6);
        const minorLanguages = allLanguages.slice(6);

        const languageNodes = primaryLanguages.map((lang) => ({
          id: lang.name,
          type: lang.name === data.district.core.name ? "core" : "language",
          bytes: lang.bytes || 1,
          percentage: lang.percentage || null
        }));

        if (minorLanguages.length > 0) {
          languageNodes.push({
            id: "Other",
            type: "language",
            bytes: minorLanguages.reduce((sum, l) => sum + (l.bytes || 1), 0)
          });
        }

        const libraryNodes = (data?.district?.libraries || []).map((lib) => ({
          id: lib.name,
          type: "library",
          bytes: 1
        }));

        // 7️⃣ LIMIT MAX TOWERS FOR MOBILE (SOFT LIMIT)
        const limitedNodes = isMobile ? [...languageNodes, ...libraryNodes].slice(0, 12) : [...languageNodes, ...libraryNodes];
        setGraphData({
          nodes: limitedNodes,
        });

        if (session?.user) {
          await supabase.from("analyses").insert([
            {
              user_id: session.user.id,
              input_type: trimmedInput ? "github" : "resume",
              input_value: trimmedInput || "resume-upload",
              result_json: { nodes: limitedNodes }
            }
          ]);
        }
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "Something went wrong.");
      setGraphData({ nodes: [] });
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ ADD FILE ANALYZE FUNCTION
  const analyzeFile = async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setGraphData({ nodes: [] });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:8000/analyze-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data?.career_recommendation) {
        setCareerPath(data.career_recommendation);
      }

      if (!res.ok) {
        throw new Error(data.detail || "PDF analysis failed");
      }

      if (data?.district?.core) {
        const allLanguages = data.district.languages || [];
        const primaryLanguages = allLanguages.slice(0, 6);
        const minorLanguages = allLanguages.slice(6);

        const languageNodes = primaryLanguages.map((lang) => ({
          id: lang.name,
          type: lang.name === data.district.core.name ? "core" : "language",
          bytes: lang.bytes || 1,
          percentage: lang.percentage || null
        }));

        if (minorLanguages.length > 0) {
          languageNodes.push({
            id: "Other",
            type: "language",
            bytes: minorLanguages.reduce((sum, l) => sum + (l.bytes || 1), 0)
          });
        }

        const libraryNodes = (data.district.libraries || []).map((lib) => ({
          id: lib.name,
          type: "library",
          bytes: 1
        }));

        // 7️⃣ LIMIT MAX TOWERS FOR MOBILE (SOFT LIMIT)
        const limitedNodes = isMobile ? [...languageNodes, ...libraryNodes].slice(0, 12) : [...languageNodes, ...libraryNodes];
        setGraphData({
          nodes: limitedNodes,
        });

        if (session?.user) {
          await supabase.from("analyses").insert([
            {
              user_id: session.user.id,
              input_type: "resume",
              input_value: "resume-upload",
              result_json: { nodes: limitedNodes }
            }
          ]);
        }
      }

    } catch (err) {
      setError(err.message || "PDF processing failed.");
      setGraphData({ nodes: [] });
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ ADD DRAG & DROP HANDLERS
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      analyzeFile(file);
    } else {
      setError("Only PDF files are supported.");
    }
  };

  // Filtered nodes logic
  const filteredNodes = graphData.nodes.filter(node => {
    const matchesSearch = node.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" ? true : node.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredHoveredNode = filteredNodes.find(n => n.id === hovered);
  const hoveredNode = filteredHoveredNode || graphData.nodes.find(n => n.id === hovered);

  const actualRole = profile?.role || "student";
  const role = demoRoleOverride || actualRole;
  const isStudent = role === "student";
  const isinterviewer = role === "interviewer";
  const isHR = role === "hr";
  const isAdmin = actualRole === "admin";

  // 1️⃣ ADD DERIVED ANALYTICS VALUES
  const totalCities = savedCities.length;
  const totalNodesCurrent = graphData?.nodes?.length || 0;

  const mostUsedSkill = (() => {
    const count = {};
    savedCities.forEach(city => {
      city?.result_json?.nodes?.forEach(node => {
        count[node.id] = (count[node.id] || 0) + 1;
      });
    });
    return Object.keys(count).length
      ? Object.entries(count).sort((a,b)=>b[1]-a[1])[0][0]
      : null;
  })();

  // Benchmark-based gap detection
  const benchmarkSkills = [
    "DevOps",
    "System Design",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Microservices"
  ];

  const detectedSkills = graphData?.nodes?.map(n => n.id) || [];

  const benchmarkGaps = benchmarkSkills.filter(
    skill => !detectedSkills.includes(skill)
  );

  // If backend ever sends AI gaps, use them
  const aiSkillGaps = graphData?.ai_gaps || null;

  const finalSkillGaps = aiSkillGaps && aiSkillGaps.length > 0
    ? aiSkillGaps
    : benchmarkGaps;

  if (!session) {
    return <Auth />;
  }
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex justify-center">
      <div className="fixed top-6 right-8 z-[1000]">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg text-sm flex items-center gap-3 hover:bg-white/10 transition-all duration-300 hover:scale-[1.03] active:scale-95"
          >
            {(() => {
              // Use the already defined `role` variable from above

              const roleStyles = {
                student: "bg-blue-500/20 text-blue-400 border-blue-400/30",
                interviewer: "bg-green-500/20 text-green-400 border-green-400/30",
                hr: "bg-purple-500/20 text-purple-400 border-purple-400/30",
                admin: "bg-yellow-500/20 text-yellow-400 border-yellow-400/40",
              };

              const roleIcons = {
                student: "🎓",
                interviewer: "🚀",
                hr: "🧠",
                admin: "👑",
              };

              const roleTooltips = {
                student: "Can build and analyze their own skill city.",
                interviewer: "Can analyze, compare and evaluate developer skill cities.",
                hr: "Can review candidate profiles and skill dominance insights.",
                admin: "Full system access. Can switch roles and test all UI modes.",
              };

              const isinterviewer = role === "interviewer";
              const isAdminBadge = role === "admin";

              return (
                <span
                  title={roleTooltips[role]}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1
                    ${roleStyles[role]}
                    ${
                      isinterviewer
                        ? "shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"
                        : isAdminBadge
                        ? "shadow-[0_0_18px_rgba(250,204,21,0.8)]"
                        : ""
                    }
                  `}
                >
                  <span>{roleIcons[role]}</span>
                  <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                </span>
              );
            })()}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-black">
                {session?.user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-400 text-xs">
                {session?.user?.email}
              </span>
            </div>
          </button>

          {showDropdown && (
            <div className={`
  absolute right-0 mt-3 w-52 bg-[#111827] border border-white/10 rounded-xl shadow-2xl overflow-hidden
  transform transition-all duration-200 origin-top-right
  ${showDropdown ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
`}>
              <button
                onClick={() => {
                  setShowHistory(true);
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-white/10 text-sm"
              >
                Saved Cities
              </button>
              {isAdmin && (
                <div className="border-t border-white/10">
                  <div className="px-4 py-2 text-xs text-gray-400">Switch Role (Demo)</div>
                  {['student','interviewer','hr'].map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        setDemoRoleOverride(r);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-white/10"
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setDemoRoleOverride(null);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-gray-400 hover:bg-white/10"
                  >
                    Reset to Actual Role
                  </button>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left hover:bg-red-500/20 text-sm text-red-400"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="w-full max-w-5xl px-6 pt-20">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-black" />
        <h1 className="text-6xl font-semibold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          SKAFF
        </h1>
        <p className="text-lg text-gray-400 mt-3">
          Your Skill City, An AI-powered Skill Intelligence System
        </p>

        <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* interviewer Compare Toggle */}
          {isinterviewer && (
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 
  ${compareMode 
    ? "bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-105" 
    : "bg-green-500/20 border border-green-400/40 text-green-400 hover:bg-green-500/30"}`}
              >
                🔍 {compareMode ? "Exit Compare" : "Compare Mode"}
              </button>
            </div>
          )}
          {/* Candidate A Role Dropdown */}
          {isinterviewer && compareMode && (
            <div className="mb-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-green-400/40"
              >
                <option value="">Select Role (Optional)</option>
                <option value="backend">Backend Developer</option>
                <option value="frontend">Frontend Developer</option>
                <option value="devops">DevOps Engineer</option>
              </select>
            </div>
          )}
          {/* Candidate A label */}
          {isinterviewer && compareMode && (
            <div className="text-xs text-green-400 mb-2">Candidate A</div>
          )}
          <input
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300 placeholder:text-gray-500 mb-4"
            placeholder="GitHub Username OR Repo URL"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Repositories to Scan</span>
              <span className="text-xs font-semibold text-cyan-400 transition-all duration-300">
                {repoLimit}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="49"
              value={repoLimit}
              onChange={(e) => setRepoLimit(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #22d3ee 0%, #3b82f6 ${(repoLimit/49)*100}%, rgba(255,255,255,0.08) ${(repoLimit/49)*100}%, rgba(255,255,255,0.08) 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none outline-none cursor-pointer transition-all duration-300
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-cyan-400
                [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(34,211,238,0.9)]
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:duration-300
                hover:[&::-webkit-slider-thumb]:scale-110"
            />

            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>1</span>
              <span>49</span>
            </div>

            {/* Estimated Scan Time */}
            <div className="mt-3 text-xs text-gray-400">
              Estimated scan time: 
              <span className="text-cyan-400 font-medium ml-1">
                ~{Math.max(1, Math.round(repoLimit * 0.8))} seconds
              </span>
            </div>

            {/* Performance Warning */}
            {repoLimit > 30 && (
              <div className="mt-2 text-xs text-yellow-400 animate-pulse">
                ⚠ High repository count may increase processing time.
              </div>
            )}
            {/* Performance Mode Indicator */}
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <div className={`w-2 h-2 rounded-full ${repoLimit > 30 ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
              <span className={`${repoLimit > 30 ? "text-yellow-400" : "text-green-400"}`}>
                {repoLimit > 30 ? "Performance Mode: High Load" : "Performance Mode: Optimized"}
              </span>
            </div>
          </div>
          {/* Second input for compare mode */}
          {isinterviewer && compareMode && (
            <>
              <div className="text-xs text-cyan-400 mt-4 mb-2">Candidate B</div>
              <input
                className="w-full px-5 py-4 bg-white/5 border border-green-400/40 rounded-2xl focus:outline-none focus:bg-white/10"
                placeholder="Second GitHub Username"
                value={compareInput}
                onChange={(e) => setCompareInput(e.target.value)}
              />
            </>
          )}

          <textarea
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300 placeholder:text-gray-500 mb-4"
            rows="4"
            placeholder="Paste resume (optional)"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />

          {/* 4️⃣ ADD PREMIUM UPLOAD UI */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full mt-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-center transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/10 cursor-pointer"
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPdfFile(file);
                  analyzeFile(file);
                }
              }}
              className="hidden"
              id="pdfUpload"
            />

            <label htmlFor="pdfUpload" className="cursor-pointer">
              <div className="text-cyan-400 font-semibold text-lg mb-2">
                Upload Resume (PDF)
              </div>
              <div className="text-gray-400 text-sm">
                Drag & Drop your resume here or click to browse
              </div>
            </label>
          </div>

          <button
            onClick={async () => {
              if (isinterviewer && compareMode) {
                if (!inputValue || !compareInput) return;
                await analyze();
                await analyzeCompare();
              } else {
                await analyze();
              }
            }}
            disabled={loading}
            className={`mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg transition-all duration-300 ${
              loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95"
            }`}
          >
            {loading ? "Building City..." : "Build Skill City"}
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="bg-white/5 backdrop-blur-lg px-6 py-3 rounded-full border border-white/10 text-sm flex gap-6">
            <div><span className="text-cyan-400">■</span> Core Language</div>
            <div><span className="text-blue-400">■</span> Other Languages</div>
            <div><span className="text-purple-400">■</span> Libraries</div>
          </div>
        </div>

        {/* 2️⃣ ADD ANALYTICS PANEL UI */}
        <div className="mt-6 flex justify-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 text-sm flex flex-wrap gap-6">
            <div>
              <span className="text-cyan-400 font-semibold">{totalCities}</span> Cities Built
            </div>
            <div>
              <span className="text-cyan-400 font-semibold">{totalNodesCurrent}</span> Active Buildings
            </div>
            {mostUsedSkill && (
              <div>
                Most Used Skill: <span className="text-cyan-400 font-semibold">{mostUsedSkill}</span>
              </div>
            )}
          </div>
        </div>
        {careerPath && (() => {
          const roleColors = {
            backend: "from-cyan-500 to-blue-500",
            frontend: "from-pink-500 to-purple-500",
            devops: "from-green-500 to-emerald-500",
            default: "from-cyan-500 to-blue-500"
          };

          const gradient = roleColors[careerPath.best_role] || roleColors.default;
          const confidence = careerPath.confidence || 75;

          return (
            <div className={`relative mt-8 rounded-3xl p-[1px] bg-gradient-to-r ${gradient} animate-[pulse_4s_ease-in-out_infinite]`}>
              <div className="rounded-3xl bg-[#0f172a] p-6 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,255,255,0.15)]">
                <div className="flex items-center justify-between mb-6">
                  <div className="px-4 py-1 text-xs font-semibold rounded-full bg-white/10 border border-white/20 tracking-wide">
                    AI CAREER INTELLIGENCE
                  </div>
                  <div className="text-xs text-gray-400">Confidence</div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* LEFT: Role Info */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Top Recommended Role</div>
                    <div className={`text-3xl font-semibold tracking-wide bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                      {careerPath.best_role?.toUpperCase()}
                    </div>

                    <div className="mt-4 text-sm text-gray-300 leading-relaxed">
                      {careerPath.reason}
                    </div>

                    {/* Skill-to-Role Match Bars */}
                    <div className="mt-6 space-y-3">
                      {["Core Alignment", "Framework Fit", "Ecosystem Strength"].map((label, i) => {
                        const value = Math.min(100, confidence - i * 8);
                        return (
                          <div key={label}>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>{label}</span>
                              <span>{value}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${gradient} transition-all duration-1000`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT: Animated Confidence Ring */}
                  <div className="flex justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="url(#grad)"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 70}`}
                          strokeDashoffset={`${2 * Math.PI * 70 * (1 - confidence / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-white">{confidence}%</div>
                        <div className="text-xs text-gray-400">Match</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* interviewer-only advanced panel */}
        {isinterviewer && graphData?.nodes?.length > 0 && (
          <div className="mt-6 bg-green-500/10 border border-green-400/30 rounded-2xl p-5 text-sm">
            <div className="font-semibold text-green-400 mb-2">interviewer Insights</div>
            <div>📊 Skill Strength Score: {Math.min(100, totalNodesCurrent * 8)} / 100</div>
            <div className="mt-2">🧠 AI Insight: Strong backend and scalable architecture exposure.</div>
            <div className="mt-2 text-red-400">
              🧩 Skill Gaps Detected:
              {finalSkillGaps.length > 0 ? (
                <div className="mt-1">
                  {finalSkillGaps.slice(0, 4).map((skill) => (
                    <span key={skill} className="mr-2 inline-block">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="ml-2 text-green-400">None detected</span>
              )}
            </div>
          </div>
        )}

        {/* Minimal Compare Mode summary */}
        {isinterviewer && compareMode && compareGraphData.nodes.length > 0 && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="font-semibold mb-3 text-green-400">Comparison Summary</div>
            <div className="text-sm mb-2">Candidate A Skills: {graphData.nodes.length}</div>
            <div className="text-sm mb-2">Candidate B Skills: {compareGraphData.nodes.length}</div>

            <div className="text-sm mt-3">
              AI Confidence:
              <span className="text-cyan-400 ml-2">
                {Math.min(100, (graphData.nodes.length + compareGraphData.nodes.length) * 5)}%
              </span>
            </div>

            <div className="text-sm mt-3 text-red-400">
              Missing Skills (B vs A):
              {graphData.nodes
                .map(n => n.id)
                .filter(id => !compareGraphData.nodes.map(n => n.id).includes(id))
                .slice(0,5)
                .map(skill => (
                  <span key={skill} className="ml-2">{skill}</span>
                ))}
            </div>
          </div>
        )}

        {/* HR simplified summary panel */}
        {isHR && graphData?.nodes?.length > 0 && (
          <div className="mt-6 bg-purple-500/10 border border-purple-400/30 rounded-2xl p-5 text-sm">
            <div className="font-semibold text-purple-400 mb-2">HR Summary</div>
            <div>Top Skills:</div>
            {graphData.nodes.slice(0, 5).map((n) => (
              <div key={n.id}>• {n.id}</div>
            ))}
          </div>
        )}

      {loading && (
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-cyan-400">
            Designing your skill architecture...
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 font-medium">
          {error}
        </div>
      )}

      {isinterviewer && compareMode && compareGraphData.nodes.length > 0 ? (
        <>
          {/* Strength calculation for compare mode UI */}
          {(() => {
            // 1️⃣ ADD STRENGTH CALCULATION BEFORE COMPARE CANVAS RENDER
            const candidateAStrength = graphData.nodes.length;
            const candidateBStrength = compareGraphData.nodes.length;
            let stronger = null;

            if (aiConfidence !== null && selectedRole) {
              // If role selected, backend already determines stronger
              stronger = aiExplanation?.includes("Candidate A") ? "A" : aiExplanation?.includes("Candidate B") ? "B" : null;
            } else {
              stronger = candidateAStrength === candidateBStrength
                ? null
                : candidateAStrength > candidateBStrength
                ? "A"
                : "B";
            }
            return (
              <>
                <div
                  className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 animate-fadeIn"
                >
                  {/* Candidate A */}
                  <div className={`relative rounded-3xl overflow-hidden border h-[600px] transition-all duration-500 ${
                    stronger === "A"
                      ? "border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                      : stronger === "B"
                      ? "border-red-400 opacity-80"
                      : "border-white/10"
                  }`}>
                    <div className="absolute z-10 px-4 py-2 text-xs font-semibold bg-black/60 backdrop-blur-lg rounded-br-xl border-b border-r border-white/10">
                      {inputValue || "Candidate A"}
                    </div>
                    <Canvas camera={{ position: [0, 30, 80], fov: 55 }}>
                      <color attach="background" args={["#0b0f19"]} />
                      <fog attach="fog" args={["#0b0f19", 80, 350]} />
                      <pointLight position={[0, 35, 20]} intensity={1.6} color="#38bdf8" />
                      <Sparkles
                        count={30}
                        scale={[60, 25, 60]}
                        size={1}
                        speed={0.1}
                        color="#1e293b"
                      />
                      <ambientLight intensity={0.9} />
                      <directionalLight position={[40, 60, 40]} intensity={1.4} />
                      {graphData.nodes.map((node, index) => {
                        const radius = node.type === "core" ? 0 : 35;
                        const angle = index * (Math.PI * 2 / graphData.nodes.length);
                        const x = radius * Math.cos(angle);
                        const z = radius * Math.sin(angle);
                        const sizeFactor = node.bytes ? Math.log(node.bytes + 1) : 3;
                        const height = node.type === "core" ? 20 + sizeFactor * 0.8 : 8 + sizeFactor * 0.5;
                        const width = node.type === "core" ? 8 : 4;
                        return (
                          <group key={node.id}>
                            <FloatingBuilding floatIntensity={node.type === "core" ? 0.2 : 0.4}>
                              <mesh
                                position={[x, height / 2 + 1, z]}
                                onPointerOver={() => setHovered(node.id)}
                                onPointerOut={() => setHovered(null)}
                              >
                                <boxGeometry args={[width, height, width]} />
                                <meshStandardMaterial
                                  color={
                                    node.type === "core"
                                      ? "#00E5FF"
                                      : node.type === "library"
                                      ? "#a78bfa"
                                      : "#60a5fa"
                                  }
                                  emissive={node.type === "core" ? "#00E5FF" : "#000000"}
                                  emissiveIntensity={hovered === node.id ? 1.2 : 0.6}
                                  metalness={0.2}
                                  roughness={0.15}
                                  transparent
                                  opacity={0.9}
                                />
                              </mesh>
                            </FloatingBuilding>
                            <RotatingLabel position={[x, height + 2, z]}>
                              <Text fontSize={1.5} color="white" anchorX="center" anchorY="middle">
                                {node.id}
                              </Text>
                              {node.percentage && (
                                <Text
                                  position={[0, -2, 0]}
                                  fontSize={1}
                                  color="#38bdf8"
                                  anchorX="center"
                                  anchorY="middle"
                                >
                                  {node.percentage}%
                                </Text>
                              )}
                            </RotatingLabel>
                            {node.type !== "core" && (
                              <QuadraticBezierLine
                                start={[0, 1.2, 0]}
                                end={[x, 1.2, z]}
                                mid={[x / 2, 12, z / 2]}
                                color="#60a5fa"
                                lineWidth={2}
                                transparent
                                opacity={0.8}
                              />
                            )}
                          </group>
                        );
                      })}
                      <OrbitControls
                        enablePan
                        enableZoom
                        enableRotate
                        enableDamping
                        dampingFactor={0.08}
                        rotateSpeed={0.8}
                        panSpeed={0.8}
                        zoomSpeed={0.9}
                        minDistance={20}
                        maxDistance={600}
                        maxPolarAngle={Math.PI}
                      />
                    </Canvas>
                  </div>

                  {/* Candidate B */}
                  <div className={`relative rounded-3xl overflow-hidden border h-[600px] transition-all duration-500 ${
                    stronger === "B"
                      ? "border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                      : stronger === "A"
                      ? "border-red-400 opacity-80"
                      : "border-white/10"
                  }`}>
                    <div className="absolute z-10 px-4 py-2 text-xs font-semibold bg-black/60 backdrop-blur-lg rounded-br-xl border-b border-r border-white/10">
                      {compareInput || "Candidate B"}
                    </div>
                    <Canvas camera={{ position: [0, 30, 80], fov: 55 }}>
                      <color attach="background" args={["#0b0f19"]} />
                      <fog attach="fog" args={["#0b0f19", 80, 350]} />
                      <pointLight position={[0, 35, 20]} intensity={1.6} color="#38bdf8" />
                      <Sparkles
                        count={30}
                        scale={[60, 25, 60]}
                        size={1}
                        speed={0.1}
                        color="#1e293b"
                      />
                      <ambientLight intensity={0.9} />
                      <directionalLight position={[40, 60, 40]} intensity={1.4} />
                      {compareGraphData.nodes.map((node, index) => {
                        const radius = node.type === "core" ? 0 : 35;
                        const angle = index * (Math.PI * 2 / compareGraphData.nodes.length);
                        const x = radius * Math.cos(angle);
                        const z = radius * Math.sin(angle);
                        const sizeFactor = node.bytes ? Math.log(node.bytes + 1) : 3;
                        const height = node.type === "core" ? 20 + sizeFactor * 0.8 : 8 + sizeFactor * 0.5;
                        const width = node.type === "core" ? 8 : 4;
                        return (
                          <group key={node.id}>
                            <FloatingBuilding floatIntensity={node.type === "core" ? 0.2 : 0.4}>
                              <mesh
                                position={[x, height / 2 + 1, z]}
                                onPointerOver={() => setHovered(node.id)}
                                onPointerOut={() => setHovered(null)}
                              >
                                <boxGeometry args={[width, height, width]} />
                                <meshStandardMaterial
                                  color={
                                    node.type === "core"
                                      ? "#00E5FF"
                                      : node.type === "library"
                                      ? "#a78bfa"
                                      : "#60a5fa"
                                  }
                                  emissive={node.type === "core" ? "#00E5FF" : "#000000"}
                                  emissiveIntensity={hovered === node.id ? 1.2 : 0.6}
                                  metalness={0.2}
                                  roughness={0.15}
                                  transparent
                                  opacity={0.9}
                                />
                              </mesh>
                            </FloatingBuilding>
                            <RotatingLabel position={[x, height + 2, z]}>
                              <Text fontSize={1.5} color="white" anchorX="center" anchorY="middle">
                                {node.id}
                              </Text>
                              {node.percentage && (
                                <Text
                                  position={[0, -2, 0]}
                                  fontSize={1}
                                  color="#38bdf8"
                                  anchorX="center"
                                  anchorY="middle"
                                >
                                  {node.percentage}%
                                </Text>
                              )}
                            </RotatingLabel>
                            {node.type !== "core" && (
                              <QuadraticBezierLine
                                start={[0, 1.2, 0]}
                                end={[x, 1.2, z]}
                                mid={[x / 2, 12, z / 2]}
                                color="#60a5fa"
                                lineWidth={2}
                                transparent
                                opacity={0.8}
                              />
                            )}
                          </group>
                        );
                      })}
                      <OrbitControls
                        enablePan
                        enableZoom
                        enableRotate
                        enableDamping
                        dampingFactor={0.08}
                        rotateSpeed={0.8}
                        panSpeed={0.8}
                        zoomSpeed={0.9}
                        minDistance={20}
                        maxDistance={600}
                        maxPolarAngle={Math.PI}
                      />
                    </Canvas>
                  </div>
                </div>
                {/* Verdict Line */}
                {stronger && (
                  <div className="col-span-1 md:col-span-2 mt-6 text-center">
                    <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-400/40 text-green-400 text-sm font-semibold shadow-lg">
                      {stronger === "A"
                        ? "🏆 Candidate A Recommended"
                        : "🏆 Candidate B Recommended"}
                    </div>

                    <div className="mt-3">
                      <button
                        onClick={() => {
                          const aSkills = graphData.nodes.map(n => n.id);
                          const bSkills = compareGraphData.nodes.map(n => n.id);

                          const candidateAStrength = graphData.nodes.length;
                          const candidateBStrength = compareGraphData.nodes.length;
                          const strongerVal = candidateAStrength === candidateBStrength
                            ? null
                            : candidateAStrength > candidateBStrength
                            ? "A"
                            : "B";

                          if (!showWhy && strongerVal) {
                            fetchCompareInsight(strongerVal, aSkills, bSkills);
                          }
                          setShowWhy(!showWhy);
                        }}
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        {showWhy ? "Hide Why" : "Why?"}
                      </button>
                    </div>

                    {showWhy && (
                      <div className="mt-4 max-w-xl mx-auto text-sm bg-white/5 border border-white/10 rounded-2xl p-4 text-gray-300 transition-all duration-500 opacity-100 animate-fadeIn">
                        {whyLoading ? (
                          <div className="flex items-center gap-2 text-cyan-400">
                            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            Generating AI reasoning...
                          </div>
                        ) : (
                          <>
                            <div className="mb-3">
                              {aiExplanation || "No explanation available."}
                            </div>
                            {aiConfidence && (
                              <div className="text-xs text-cyan-400">
                                AI Confidence Score: {aiConfidence}%
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </>
      ) : graphData?.nodes?.length > 0 && (
        <>
          {/* Search/filter UI for buildings */}
          <div className="mt-8 mb-4 flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-400/40 w-full md:w-64"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-400/40 w-full md:w-48"
            >
              <option value="all">All Types</option>
              <option value="core">Core</option>
              <option value="language">Language</option>
              <option value="library">Library</option>
            </select>
          </div>
          <div
            ref={canvasContainerRef}
            className={`relative ${
              isFullscreen
                ? "fixed inset-0 z-50 bg-[#0b0f19]"
                : "mt-16 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,255,255,0.1)]"
            } h-[500px] sm:h-[600px] md:h-[700px] lg:h-[750px]`}
          >
          <button
            onClick={async () => {
              if (!document.fullscreenElement) {
                await canvasContainerRef.current.requestFullscreen();
                setIsFullscreen(true);
              } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
              }
            }}
            className="absolute top-4 right-4 z-[100] px-4 py-2 text-sm rounded-full bg-black/60 backdrop-blur-lg border border-white/20 hover:bg-black/80 transition-all pointer-events-auto"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M21 15v4a2 2 0 01-2 2h-4M3 15v4a2 2 0 002 2h4" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6" />
              </svg>
            )}
          </button>
          {/* 2️⃣ ADD EXPORT BUTTON (NEXT TO FULLSCREEN BUTTON) */}
          <button
            onClick={exportImage}
            className="absolute top-4 right-16 z-[100] px-4 py-2 text-sm rounded-full bg-black/60 backdrop-blur-lg border border-white/20 hover:bg-black/80 transition-all pointer-events-auto"
            title="Export Image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v4a2 2 0 002 2h12a2 2 0 002-2v-4M12 12v8M12 12l-3-3M12 12l3-3" />
            </svg>
          </button>
          <Canvas
            camera={{
              position: isFullscreen ? [0, 40, 120] : [0, 30, 80],
              fov: 55
            }}
            dpr={isMobile ? 1 : 1.5}
            shadows={!isMobile}
            gl={{
              antialias: !isMobile,
              preserveDrawingBuffer: true
            }}
          >
            <color attach="background" args={["#0b0f19"]} />
            <fog attach="fog" args={["#0b0f19", 80, 350]} />

            <ambientLight intensity={0.9} />
            <directionalLight position={[40, 60, 40]} intensity={1.4} />
            <pointLight position={[0, 35, 20]} intensity={1.6} color="#38bdf8" />

            <Sparkles
              count={isMobile ? 15 : 40}
              scale={[60, 25, 60]}
              size={1}
              speed={0.1}
              color="#1e293b"
            />

            {filteredNodes.map((node, index) => {
              const nonCoreCount = filteredNodes.filter(n => n.type !== "core").length;

              let x = 0;
              let z = 0;

              if (node.type !== "core" && nonCoreCount > 0) {
                const nonCoreIndex = filteredNodes
                  .filter((n, i) => n.type !== "core" && i < index)
                  .length;

                const angle = nonCoreIndex * (Math.PI * 2 / nonCoreCount);
                const radius = 35;

                x = radius * Math.cos(angle);
                z = radius * Math.sin(angle);
              }

              const sizeFactor = node.bytes ? Math.log(node.bytes + 1) : 3;
              const height = node.type === "core"
                ? 20 + sizeFactor * 0.8
                : 8 + sizeFactor * 0.5;

              const width = node.type === "core" ? 8 : 4;

              return (
                <group key={node.id}>
                  <FloatingBuilding floatIntensity={node.type === "core" ? 0.2 : 0.4}>
                    <mesh
                      position={[x, height / 2 + 1, z]}
                      onPointerOver={() => setHovered(node.id)}
                      onPointerOut={() => setHovered(null)}
                      onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                    >
                      <boxGeometry args={[width, height, width]} />
                      <meshStandardMaterial
                        color={
                          node.type === "core"
                            ? "#00E5FF"
                            : node.type === "library"
                            ? "#a78bfa"
                            : "#60a5fa"
                        }
                        emissive={
                          selectedNode === node.id
                            ? "#ffffff"
                            : node.type === "core"
                            ? "#00E5FF"
                            : "#000000"
                        }
                        emissiveIntensity={
                          selectedNode === node.id
                            ? 2.5
                            : hovered === node.id
                            ? 1.2
                            : 0.6
                        }
                        metalness={0.2}
                        roughness={0.15}
                        transparent
                        opacity={
                          selectedNode
                            ? node.id === selectedNode || node.type === "core"
                              ? 0.95
                              : 0.2
                            : 0.9
                        }
                      />
                    </mesh>
                  </FloatingBuilding>

                  <RotatingLabel position={[x, height + 2, z]}>
                    <Text fontSize={1.5} color="white" anchorX="center" anchorY="middle">
                      {node.id}
                    </Text>

                    {node.percentage && (
                      <Text
                        position={[0, -2, 0]}
                        fontSize={1}
                        color="#38bdf8"
                        anchorX="center"
                        anchorY="middle"
                      >
                        {node.percentage}%
                      </Text>
                    )}
                  </RotatingLabel>

                  {/* 3️⃣ UPDATE connection line rendering logic */}
                  {node.type !== "core" && (
                    <QuadraticBezierLine
                      start={[0, 1.2, 0]}
                      end={[x, 1.2, z]}
                      mid={[x / 2, 12, z / 2]}
                      color={selectedNode === node.id ? "#22d3ee" : "#60a5fa"}
                      lineWidth={selectedNode === node.id ? 3 : 2}
                      transparent
                      opacity={
                        selectedNode
                          ? selectedNode === node.id || node.type === "core"
                            ? 1
                            : 0.2
                          : 0.8
                      }
                    />
                  )}
                </group>
              );
            })}

            {/* City Base Platform */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[180, 180, 1.2, 128]} />
              <meshStandardMaterial
                color="#111827"
                metalness={0.4}
                roughness={0.2}
                transparent
                opacity={0.95}
              />
            </mesh>

            {/* Glass floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[400, 400]} />
              <MeshReflectorMaterial
                blur={isMobile ? [100, 30] : [300, 100]}
                resolution={isMobile ? 256 : 1024}
                mixBlur={1}
                mixStrength={isMobile ? 5 : 15}
                roughness={0.3}
                depthScale={1}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#0f172a"
                metalness={0.6}
              />
            </mesh>

            <ContactShadows
              position={[0, 0.01, 0]}
              opacity={0.5}
              scale={isMobile ? 40 : 80}
              blur={isMobile ? 1 : 2}
              far={20}
            />

            <group position={[0, 0, 0]} />
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              enableDamping
              dampingFactor={0.08}
              rotateSpeed={0.8}
              panSpeed={0.8}
              zoomSpeed={0.9}
              minDistance={20}
              maxDistance={isMobile ? 600 : 1200}
              maxPolarAngle={Math.PI}
            />
            {/* Invisible mesh for empty click to reset selection */}
            <mesh
              position={[0, 0.5, 0]}
              onClick={() => setSelectedNode(null)}
              visible={false}
            >
              <boxGeometry args={[500, 1, 500]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </Canvas>
        </div>
        </>
      )}

      {hoveredNode && (
        <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl border border-cyan-500/30 text-white px-5 py-4 rounded-xl shadow-2xl w-64 transition-all duration-300">
          <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
            {hoveredNode.type}
          </div>

          <div className="text-lg font-semibold text-white mb-2">
            {hoveredNode.id}
          </div>

          {!isHR && hoveredNode.bytes && (
            <div className="text-sm text-gray-300">
              Code Size Factor: <span className="text-cyan-400">
                {Math.round(Math.log(hoveredNode.bytes + 1))}
              </span>
            </div>
          )}

          {!isHR && hoveredNode.percentage && (
            <div className="text-sm text-gray-300 mt-1">
              Dominance: <span className="text-cyan-400">
                {hoveredNode.percentage}%
              </span>
            </div>
          )}

          <div className="text-sm text-gray-300 mt-1">
            Building Height: <span className="text-cyan-400">
              {hoveredNode.type === "core" ? "Dominant" : "Supporting"}
            </span>
          </div>
          {/* 5️⃣ ADD relationship type in hover card */}
          <div className="text-sm text-gray-300 mt-1">
            Relationship: <span className="text-cyan-400">
              {hoveredNode.type === "core" ? "Primary Skill" : "Connected Skill"}
            </span>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[2000] flex justify-end">
          <div className="w-96 bg-[#0f172a] border-l border-white/10 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Saved Cities</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {savedCities.length === 0 && (
              <div className="text-gray-400 text-sm">No saved analyses yet.</div>
            )}

            {savedCities.map((item, index) => (
              <div
                key={index}
                className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer"
                onClick={() => {
                  setGraphData(item.result_json);
                  setShowHistory(false);
                }}
              >
                <div className="text-sm text-cyan-400">
                  {item.input_type}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;