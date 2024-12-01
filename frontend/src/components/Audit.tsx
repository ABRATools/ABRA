import { useEffect, useState, useMemo } from 'react';
import Navbar from './Navbar';
import useAuth from '../hooks/useAuth';
import { ThemeProvider } from './Theming/ThemeProvider';

const REFRESH_INTERVAL = 30000;

interface MatchPosition {
  line: number;
  partIndex: number;
  matchIndex: number;
  globalMatchIndex: number;
}

export default function Audit() {
  const { isAuthorized, loading } = useAuth(() => {
		window.location.href = '/login';
	});
	if (isAuthorized) {
		console.log('Authorized');
	}
	if (loading) {
		return <div>Loading...</div>;
	}
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <RenderAudit />
    </ThemeProvider>
  );
}

const RenderAudit = () => {
  //   holds the audit log data
  const [auditLog, setAuditLog] = useState('');
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(REFRESH_INTERVAL / 1000);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchPositions, setMatchPositions] = useState<MatchPosition[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const token = sessionStorage.getItem('token');
  if (!token) {
    return <div>Unauthorized</div>;
  }

  useEffect(() => {
    const fetchAuditLog = async () => {
      try {
        const response = await fetch('/audit_log', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        );
        if (response.ok) {
          const data = await response.json();
          setAuditLog(data.audit_log);
        } else {
          console.error('Failed to fetch audit log');
        }
      } catch (error) {
        console.error('Error fetching audit log:', error);
      }
    };

    // Fetch the audit log immediately
    fetchAuditLog();

    // Fetch the audit log every REFRESH_INTERVAL
    const interval = setInterval(() => {
      fetchAuditLog();
    }, REFRESH_INTERVAL);

    // Clear interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Update time until refresh every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilRefresh((prevTime) => {
        if (prevTime <= 1) {
          return REFRESH_INTERVAL / 1000;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  // wrap back up
  useEffect(() => {
    if (currentMatchIndex >= matchPositions.length) {
      setCurrentMatchIndex(0);
    }
  }, [matchPositions.length]);

  // scroll on change
  useEffect(() => {
    scrollToMatch(currentMatchIndex);
  }, [currentMatchIndex]);

  // Update match positions when auditLog or searchTerm changes
  useEffect(() => {
    const { positions } = getHighlightedAuditLog(auditLog, searchTerm);
    setMatchPositions(positions);
    setCurrentMatchIndex(0);
  }, [auditLog, searchTerm]);

  // escape regex
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

    // highlight the audit log based on the search term
  function getHighlightedAuditLog(auditLog: string, searchTerm: string) {
    const positions: MatchPosition[] = [];
    let highlightedLines;

    if (!searchTerm) {
      highlightedLines = auditLog.split('\n').map((line, index) => (
        <div key={index} id={`line-${index}`}>
          {line}
        </div>
      ));
    } else {
    // non case sensitive search
      const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
      let globalMatchIndex = 0;

      highlightedLines = auditLog.split('\n').map((line, index) => {
        const parts = line.split(regex);
        let matchIndexInLine = 0;

        // highlight the parts that match the search term, and keep track of their positions
        const lineContent = parts.map((part, i) => {
          if (regex.test(part)) {
            const isActive = globalMatchIndex === currentMatchIndex;
            positions.push({
              line: index,
              partIndex: i,
              matchIndex: matchIndexInLine++,
              globalMatchIndex: globalMatchIndex++,
            });

            return (
              <span
                key={i}
                className={isActive ? 'bg-red-500 text-black' : 'bg-yellow-300 text-black'}
                id={isActive ? 'current-match' : undefined}
              >
                {part}
              </span>
            );
          } else {
            return part;
          }
        });

        return (
          <div key={index} id={`line-${index}`}>
            {lineContent}
          </div>
        );
      });
    }

    return { highlightedLines, positions };
  }

  function scrollToMatch(matchIndex: number) {
    if (matchPositions.length === 0) return;

    const match = matchPositions[matchIndex];
    const lineElement = document.getElementById(`line-${match.line}`);
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // get the previous match with wrap around
  function handlePreviousMatch() {
    setCurrentMatchIndex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : matchPositions.length - 1;
      return newIndex;
    });
  }
  // get the next match with wrap around
  function handleNextMatch() {
    setCurrentMatchIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % matchPositions.length;
      return newIndex;
    });
  }

//return the blob
  function handleExport() {
    const element = document.createElement('a');
    const file = new Blob([auditLog], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'audit_log.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Memoize the highlighted content to prevent unnecessary re-renders
  const highlightedContent = useMemo(() => {
    return getHighlightedAuditLog(auditLog, searchTerm).highlightedLines;
  }, [auditLog, searchTerm, currentMatchIndex]);

  return (
    <div>
      <Navbar />
      <div className="flex flex-col w-full">
        <div className="flex flex-row w-full justify-between px-[10px] lg:px-[60px] min-w-max py-[25px]">
          <div className="flex flex-row justify-between max-w-max gap-x-[5vw]">
            <h1 className="text-3xl font-semibold align-middle">Audit Log</h1>
            <div className="flex flex-row">
              <input
                className="border border-gray-300 p-2"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="bg-abra-accent text-white p-2 rounded-lg ml-2"
                onClick={handlePreviousMatch}
                disabled={matchPositions.length === 0}
              >
                Previous
              </button>
              <button
                className="bg-abra-accent text-white p-2 rounded-lg ml-2"
                onClick={handleNextMatch}
                disabled={matchPositions.length === 0}
              >
                Next
              </button>
              <button
                className="bg-abra-accent text-white p-2 rounded-lg ml-[50px]"
                onClick={handleExport}
              >
                Export
              </button>
            </div>
          </div>
          <div className="flex flex-row justify-around">
            <pre className="text-lg self-center mr-[10px] min-w-max">
              Refreshing in {timeUntilRefresh} seconds
            </pre>
            <span className="loading loading-ring loading-lg"></span>
          </div>
        </div>
        <div className="flex flex-col px-[10px] lg:px-[60px]">
          <div className="bg-black text-white p-2 rounded-sm w-full h-max max-h-[90vh] overflow-x-auto overflow-y-auto">
            <div className="text-sm font-mono">
              {highlightedContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}