import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

interface MarvelCharacter {
  id: number;
  name: string;
  codeName: string;
  age: number;
  ranking: number;
  birthPlace: string;
  dateOfBirth: string;
  affiliation: string;
  status: 'Active' | 'Retired' | 'Deceased' | 'Unknown';
  species: string;
  firstAppearance: string;
  abilities: string[];
  moviesCount: number;
  currentLocation: string;
}

type SortDirection = 'asc' | 'desc' | null;
type SortField = keyof MarvelCharacter | null;

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const marvelCharacters: MarvelCharacter[] = [
  { id: 1, name: 'Peter Parker', codeName: 'Spider-Man', age: 28, ranking: 450, birthPlace: 'Queens, New York', dateOfBirth: '08/10/1995', affiliation: 'Avengers', status: 'Active', species: 'Human (Enhanced)', firstAppearance: 'Amazing Fantasy #15 (1962)', abilities: ['Wall-Crawling', 'Spider-Sense', 'Superhuman Strength', 'Web-Slinging', 'Enhanced Reflexes'], moviesCount: 11, currentLocation: 'New York City' },
  { id: 2, name: 'Tony Stark', codeName: 'Iron Man', age: 53, ranking: 780, birthPlace: 'Manhattan, New York', dateOfBirth: '05/29/1970', affiliation: 'Avengers', status: 'Deceased', species: 'Human', firstAppearance: 'Tales of Suspense #39 (1963)', abilities: ['Genius Intellect', 'Powered Armor', 'Flight', 'Energy Projection', 'Advanced Weaponry'], moviesCount: 10, currentLocation: 'N/A' },
  { id: 3, name: 'Steve Rogers', codeName: 'Captain America', age: 105, ranking: 680, birthPlace: 'Brooklyn, New York', dateOfBirth: '07/04/1918', affiliation: 'Avengers', status: 'Retired', species: 'Human (Enhanced)', firstAppearance: 'Captain America Comics #1 (1941)', abilities: ['Super Soldier Serum', 'Peak Human Condition', 'Master Tactician', 'Shield Combat', 'Leadership'], moviesCount: 11, currentLocation: 'Unknown' },
  { id: 4, name: 'Natasha Romanoff', codeName: 'Black Widow', age: 39, ranking: 520, birthPlace: 'Stalingrad, Russia', dateOfBirth: '11/22/1984', affiliation: 'Avengers', status: 'Deceased', species: 'Human (Enhanced)', firstAppearance: 'Tales of Suspense #52 (1964)', abilities: ['Master Spy', 'Expert Marksman', 'Peak Human Agility', 'Martial Arts Master', 'Covert Operations'], moviesCount: 9, currentLocation: 'N/A' },
  { id: 5, name: 'Bruce Banner', codeName: 'Hulk', age: 49, ranking: 920, birthPlace: 'Dayton, Ohio', dateOfBirth: '12/18/1974', affiliation: 'Avengers', status: 'Active', species: 'Human (Gamma Mutate)', firstAppearance: 'The Incredible Hulk #1 (1962)', abilities: ['Superhuman Strength', 'Regeneration', 'Near Invulnerability', 'Genius Intellect', 'Gamma Radiation'], moviesCount: 7, currentLocation: 'Mexico' },
  { id: 6, name: 'Thor Odinson', codeName: 'Thor', age: 1500, ranking: 950, birthPlace: 'Asgard', dateOfBirth: '01/01/0518', affiliation: 'Avengers', status: 'Active', species: 'Asgardian', firstAppearance: 'Journey into Mystery #83 (1962)', abilities: ['Godly Strength', 'Weather Manipulation', 'Lightning Control', 'Flight', 'Mjolnir Mastery', 'Immortality'], moviesCount: 8, currentLocation: 'New Asgard, Norway' },
  { id: 7, name: 'Clint Barton', codeName: 'Hawkeye', age: 52, ranking: 380, birthPlace: 'Waverly, Iowa', dateOfBirth: '01/07/1971', affiliation: 'Avengers', status: 'Retired', species: 'Human', firstAppearance: 'Tales of Suspense #57 (1964)', abilities: ['Master Archer', 'Expert Marksman', 'Weapons Proficiency', 'Martial Arts', 'Tactical Analysis'], moviesCount: 6, currentLocation: 'Iowa Farm' },
  { id: 8, name: 'Wanda Maximoff', codeName: 'Scarlet Witch', age: 32, ranking: 890, birthPlace: 'Sokovia', dateOfBirth: '02/10/1991', affiliation: 'Avengers', status: 'Unknown', species: 'Human (Enhanced)', firstAppearance: 'The X-Men #4 (1964)', abilities: ['Chaos Magic', 'Reality Warping', 'Telekinesis', 'Energy Projection', 'Telepathy', 'Flight'], moviesCount: 6, currentLocation: 'Unknown' },
  { id: 9, name: 'Stephen Strange', codeName: 'Doctor Strange', age: 45, ranking: 870, birthPlace: 'Philadelphia, Pennsylvania', dateOfBirth: '11/18/1978', affiliation: 'Avengers', status: 'Active', species: 'Human (Sorcerer)', firstAppearance: 'Strange Tales #110 (1963)', abilities: ['Master of Mystic Arts', 'Astral Projection', 'Time Manipulation', 'Dimensional Travel', 'Spell Casting'], moviesCount: 5, currentLocation: 'Sanctum Sanctorum, NYC' },
  { id: 10, name: "T'Challa", codeName: 'Black Panther', age: 41, ranking: 710, birthPlace: 'Wakanda', dateOfBirth: '05/21/1982', affiliation: 'Avengers', status: 'Deceased', species: 'Human (Enhanced)', firstAppearance: 'Fantastic Four #52 (1966)', abilities: ['Vibranium Suit', 'Enhanced Strength', 'Enhanced Speed', 'Master Tactician', 'Martial Arts Master'], moviesCount: 4, currentLocation: 'N/A' },
  { id: 11, name: 'Carol Danvers', codeName: 'Captain Marvel', age: 58, ranking: 940, birthPlace: 'Boston, Massachusetts', dateOfBirth: '04/24/1965', affiliation: 'Avengers', status: 'Active', species: 'Human-Kree Hybrid', firstAppearance: 'Marvel Super-Heroes #13 (1968)', abilities: ['Energy Absorption', 'Photon Blasts', 'Flight', 'Superhuman Strength', 'Binary Form', 'Space Survival'], moviesCount: 3, currentLocation: 'Space' },
  { id: 12, name: 'Scott Lang', codeName: 'Ant-Man', age: 54, ranking: 410, birthPlace: 'Coral Gables, Florida', dateOfBirth: '04/06/1969', affiliation: 'Avengers', status: 'Active', species: 'Human', firstAppearance: 'The Avengers #181 (1979)', abilities: ['Size Manipulation', 'Insect Communication', 'Enhanced Strength (Giant)', 'Quantum Realm Access', 'Master Thief'], moviesCount: 3, currentLocation: 'San Francisco' },
  { id: 13, name: 'Hope van Dyne', codeName: 'Wasp', age: 37, ranking: 430, birthPlace: 'Los Angeles, California', dateOfBirth: '10/12/1986', affiliation: 'Avengers', status: 'Active', species: 'Human', firstAppearance: 'Tales to Astonish #44 (1963)', abilities: ['Size Manipulation', 'Flight', 'Bio-Electric Blasts', 'Martial Arts', 'Espionage'], moviesCount: 2, currentLocation: 'San Francisco' },
  { id: 14, name: 'Sam Wilson', codeName: 'Falcon', age: 42, ranking: 470, birthPlace: 'Harlem, New York', dateOfBirth: '09/23/1981', affiliation: 'Avengers', status: 'Active', species: 'Human', firstAppearance: 'Captain America #117 (1969)', abilities: ['Flight (Winged Suit)', 'Tactical Combat', 'EXO-7 Falcon', 'Redwing Drone', 'Shield Proficiency'], moviesCount: 6, currentLocation: 'Washington D.C.' },
  { id: 15, name: 'James Rhodes', codeName: 'War Machine', age: 56, ranking: 630, birthPlace: 'Philadelphia, Pennsylvania', dateOfBirth: '10/08/1967', affiliation: 'Avengers', status: 'Active', species: 'Human', firstAppearance: 'Iron Man #118 (1979)', abilities: ['Powered Armor', 'Heavy Weaponry', 'Flight', 'Military Tactics', 'Repulsor Technology'], moviesCount: 7, currentLocation: 'U.S. Air Force Base' },
  { id: 16, name: 'Vision', codeName: 'Vision', age: 8, ranking: 820, birthPlace: 'Seoul, South Korea', dateOfBirth: '05/01/2015', affiliation: 'Avengers', status: 'Deceased', species: 'Synthezoid', firstAppearance: 'The Avengers #57 (1968)', abilities: ['Mind Stone Powers', 'Density Manipulation', 'Energy Projection', 'Flight', 'Superhuman Intelligence', 'Phasing'], moviesCount: 3, currentLocation: 'N/A' },
  { id: 17, name: 'Bucky Barnes', codeName: 'Winter Soldier', age: 106, ranking: 580, birthPlace: 'Shelbyville, Indiana', dateOfBirth: '03/10/1917', affiliation: 'Avengers', status: 'Active', species: 'Human (Enhanced)', firstAppearance: 'Captain America Comics #1 (1941)', abilities: ['Vibranium Arm', 'Expert Marksman', 'Master Assassin', 'Martial Arts', 'Enhanced Strength'], moviesCount: 5, currentLocation: 'New York City' },
  { id: 18, name: 'Loki Laufeyson', codeName: 'Loki', age: 1054, ranking: 750, birthPlace: 'Jotunheim', dateOfBirth: '12/17/0965', affiliation: 'Independent', status: 'Deceased', species: 'Frost Giant', firstAppearance: 'Venus #6 (1949)', abilities: ['Shape-Shifting', 'Illusion Casting', 'Telekinesis', 'Energy Projection', 'Master Manipulator', 'Immortality'], moviesCount: 6, currentLocation: 'N/A' },
  { id: 19, name: 'Wade Wilson', codeName: 'Deadpool', age: 45, ranking: 560, birthPlace: 'Regina, Saskatchewan', dateOfBirth: '11/22/1978', affiliation: 'Independent', status: 'Active', species: 'Human (Mutate)', firstAppearance: 'The New Mutants #98 (1991)', abilities: ['Regeneration', 'Superhuman Agility', 'Master Swordsman', 'Expert Marksman', 'Fourth Wall Breaking'], moviesCount: 3, currentLocation: 'New York City' },
  { id: 20, name: 'Matt Murdock', codeName: 'Daredevil', age: 44, ranking: 490, birthPlace: "Hell's Kitchen, New York", dateOfBirth: '04/16/1979', affiliation: 'Defenders', status: 'Active', species: 'Human (Enhanced)', firstAppearance: 'Daredevil #1 (1964)', abilities: ['Radar Sense', 'Enhanced Hearing', 'Superhuman Balance', 'Master Martial Artist', 'Legal Expertise'], moviesCount: 1, currentLocation: 'New York City' },
  { id: 21, name: 'Jessica Jones', codeName: 'Jewel', age: 42, ranking: 380, birthPlace: 'Forest Hills, New York', dateOfBirth: '06/20/1981', affiliation: 'Defenders', status: 'Active', species: 'Human (Enhanced)', firstAppearance: 'Alias #1 (2001)', abilities: ['Superhuman Strength', 'Flight (limited)', 'Durability', 'Private Investigation', 'Combat Skills'], moviesCount: 0, currentLocation: 'New York City' },
  { id: 22, name: 'Luke Cage', codeName: 'Power Man', age: 45, ranking: 520, birthPlace: 'Harlem, New York', dateOfBirth: '12/24/1978', affiliation: 'Defenders', status: 'Active', species: 'Human (Enhanced)', firstAppearance: 'Luke Cage, Hero for Hire #1 (1972)', abilities: ['Unbreakable Skin', 'Superhuman Strength', 'Accelerated Healing', 'Street Fighting', 'Leadership'], moviesCount: 0, currentLocation: 'New York City' },
  { id: 23, name: 'Danny Rand', codeName: 'Iron Fist', age: 38, ranking: 440, birthPlace: 'New York City', dateOfBirth: '03/19/1985', affiliation: 'Defenders', status: 'Active', species: 'Human (Chi-Enhanced)', firstAppearance: 'Marvel Premiere #15 (1974)', abilities: ['Iron Fist Technique', 'Master Martial Artist', 'Chi Manipulation', 'Healing Factor', 'Nerve Strike'], moviesCount: 0, currentLocation: 'K\'un-Lun' },
  { id: 24, name: 'Eddie Brock', codeName: 'Venom', age: 41, ranking: 720, birthPlace: 'San Francisco, California', dateOfBirth: '08/02/1982', affiliation: 'Independent', status: 'Active', species: 'Human-Symbiote', firstAppearance: 'The Amazing Spider-Man #300 (1988)', abilities: ['Symbiote Powers', 'Superhuman Strength', 'Shape-Shifting', 'Web Generation', 'Camouflage', 'Healing Factor'], moviesCount: 2, currentLocation: 'San Francisco' },
  { id: 25, name: 'Shang-Chi', codeName: 'Master of Kung Fu', age: 34, ranking: 510, birthPlace: 'Henan, China', dateOfBirth: '07/13/1989', affiliation: 'Independent', status: 'Active', species: 'Human', firstAppearance: 'Special Marvel Edition #15 (1973)', abilities: ['Master Martial Artist', 'Chi Control', 'Ten Rings Mastery', 'Weapons Expertise', 'Tactical Genius'], moviesCount: 1, currentLocation: 'Ta Lo' },
  { id: 26, name: 'Marc Spector', codeName: 'Moon Knight', age: 47, ranking: 480, birthPlace: 'Chicago, Illinois', dateOfBirth: '03/09/1976', affiliation: 'Independent', status: 'Active', species: 'Human (Avatar)', firstAppearance: 'Werewolf by Night #32 (1975)', abilities: ['Enhanced Strength (Lunar)', 'Expert Combatant', 'Weapon Mastery', 'Detective Skills', 'Multiple Personalities'], moviesCount: 0, currentLocation: 'New York City' },
  { id: 27, name: 'Jennifer Walters', codeName: 'She-Hulk', age: 36, ranking: 650, birthPlace: 'Los Angeles, California', dateOfBirth: '05/07/1987', affiliation: 'Avengers', status: 'Active', species: 'Human (Gamma Mutate)', firstAppearance: 'The Savage She-Hulk #1 (1980)', abilities: ['Superhuman Strength', 'Enhanced Durability', 'Legal Expertise', 'Intelligence Retention', 'Accelerated Healing'], moviesCount: 0, currentLocation: 'Los Angeles' },
  { id: 28, name: 'Kamala Khan', codeName: 'Ms. Marvel', age: 19, ranking: 340, birthPlace: 'Jersey City, New Jersey', dateOfBirth: '02/15/2004', affiliation: 'Avengers', status: 'Active', species: 'Human (Inhuman)', firstAppearance: 'Captain Marvel #14 (2013)', abilities: ['Shape-Shifting', 'Size Manipulation', 'Healing Factor', 'Bioluminescence', 'Elasticity'], moviesCount: 1, currentLocation: 'Jersey City' },
  { id: 29, name: 'America Chavez', codeName: 'Miss America', age: 22, ranking: 790, birthPlace: 'Utopian Parallel', dateOfBirth: '06/30/2001', affiliation: 'Young Avengers', status: 'Active', species: 'Interdimensional Being', firstAppearance: 'Vengeance #1 (2011)', abilities: ['Dimensional Travel', 'Superhuman Strength', 'Flight', 'Star Portals', 'Invulnerability', 'Super Speed'], moviesCount: 1, currentLocation: 'Multiverse' },
  { id: 30, name: 'Kate Bishop', codeName: 'Hawkeye', age: 24, ranking: 360, birthPlace: 'New York City', dateOfBirth: '11/03/1999', affiliation: 'Young Avengers', status: 'Active', species: 'Human', firstAppearance: 'Young Avengers #1 (2005)', abilities: ['Master Archer', 'Expert Marksman', 'Martial Arts', 'Tactical Skills', 'Detective Work'], moviesCount: 0, currentLocation: 'New York City' },
];

export default function MarvelTable() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedCharacter, setSelectedCharacter] = useState<MarvelCharacter | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleSort = useCallback((field: keyof MarvelCharacter) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        if (prev.direction === 'asc') return { field, direction: 'desc' };
        if (prev.direction === 'desc') return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let result = [...marvelCharacters];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((char) => {
        return (
          char.name.toLowerCase().includes(term) ||
          char.codeName.toLowerCase().includes(term) ||
          char.birthPlace.toLowerCase().includes(term) ||
          char.affiliation.toLowerCase().includes(term) ||
          char.species.toLowerCase().includes(term) ||
          char.currentLocation.toLowerCase().includes(term) ||
          char.status.toLowerCase().includes(term) ||
          char.abilities.some((ability) => ability.toLowerCase().includes(term))
        );
      });
    }

    if (sortConfig.field && sortConfig.direction) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.field as keyof MarvelCharacter];
        const bVal = b[sortConfig.field as keyof MarvelCharacter];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    return result;
  }, [searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const handleRowClick = useCallback((character: MarvelCharacter) => {
    setSelectedCharacter(character);
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedCharacter(null);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCharacter) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedCharacter, closeDrawer]);

  useEffect(() => {
    if (selectedCharacter && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabTrap = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      drawerRef.current.addEventListener('keydown', handleTabTrap as EventListener);
      firstElement?.focus();

      return () => {
        drawerRef.current?.removeEventListener('keydown', handleTabTrap as EventListener);
      };
    }
  }, [selectedCharacter]);

  const getRankingColor = (ranking: number): string => {
    const normalized = ranking / 1000;
    if (normalized < 0.33) return '#3B82F6';
    if (normalized < 0.66) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusColor = (status: string): { bg: string; text: string } => {
    switch (status) {
      case 'Active': return { bg: '#10B981', text: '#FFFFFF' };
      case 'Retired': return { bg: '#F59E0B', text: '#000000' };
      case 'Deceased': return { bg: '#EF4444', text: '#FFFFFF' };
      case 'Unknown': return { bg: '#6B7280', text: '#FFFFFF' };
      default: return { bg: '#6B7280', text: '#FFFFFF' };
    }
  };

  const renderAbilities = (abilities: string[]): React.ReactNode => {
    const displayCount = 3;
    const shown = abilities.slice(0, displayCount);
    const remaining = abilities.length - displayCount;

    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
        {shown.map((ability, idx) => (
          <span
            key={idx}
            style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
              color: '#FEF2F2',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              border: '1px solid #7F1D1D',
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
            }}
          >
            {ability}
          </span>
        ))}
        {remaining > 0 && (
          <span
            style={{
              background: '#1F2937',
              color: '#F59E0B',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '700',
              border: '1px solid #374151',
            }}
          >
            +{remaining} more
          </span>
        )}
      </div>
    );
  };

  const SortIndicator = ({ field }: { field: keyof MarvelCharacter }) => {
    if (sortConfig.field !== field) return null;
    return (
      <span style={{ marginLeft: '6px', fontSize: '14px', fontWeight: 'bold' }}>
        {sortConfig.direction === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const tableHeaderStyle: React.CSSProperties = {
    padding: '16px 12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
    color: '#FFFFFF',
    cursor: 'pointer',
    userSelect: 'none',
    borderRight: '1px solid #7F1D1D',
    transition: 'all 0.2s ease',
    position: 'relative',
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '14px 12px',
    fontSize: '13px',
    borderBottom: '2px solid #FEE2E2',
    color: '#1F2937',
    borderRight: '1px solid #FEE2E2',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)',
        padding: '40px 20px',
        fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '72px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 50%, #DC2626 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
              letterSpacing: '6px',
              margin: '0 0 12px 0',
              textShadow: '4px 4px 8px rgba(220, 38, 38, 0.5)',
            }}
          >
            Marvel Database
          </h1>
          <div
            style={{
              fontSize: '16px',
              color: '#F59E0B',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontWeight: '700',
            }}
          >
            S.H.I.E.L.D. Personnel Records • Classified Access
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="SEARCH DATABASE: NAME, ABILITIES, LOCATION..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '18px 24px',
              fontSize: '15px',
              fontWeight: '700',
              background: '#111827',
              border: '3px solid #DC2626',
              borderRadius: '8px',
              color: '#F59E0B',
              outline: 'none',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.borderColor = '#F59E0B';
              e.target.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.6)';
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.borderColor = '#DC2626';
              e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
            }}
          />
        </div>

        {/* Table */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(220, 38, 38, 0.4), 0 0 0 4px #DC2626',
            border: '4px solid #DC2626',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              role="table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: '#FFFFFF',
              }}
            >
              <thead>
                <tr role="row">
                  <th
                    role="columnheader"
                    aria-sort={sortConfig.field === 'name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={() => handleSort('name')}
                    style={{ ...tableHeaderStyle }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#991B1B')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)')}
                  >
                    Name <SortIndicator field="name" />
                  </th>
                  <th
                    role="columnheader"
                    aria-sort={sortConfig.field === 'codeName' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={() => handleSort('codeName')}
                    style={{ ...tableHeaderStyle }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#991B1B')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)')}
                  >
                    Code Name <SortIndicator field="codeName" />
                  </th>
                  <th
                    role="columnheader"
                    aria-sort={sortConfig.field === 'ranking' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={() => handleSort('ranking')}
                    style={{ ...tableHeaderStyle }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#991B1B')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)')}
                  >
                    Ranking <SortIndicator field="ranking" />
                  </th>
                  <th
                    role="columnheader"
                    aria-sort={sortConfig.field === 'status' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={() => handleSort('status')}
                    style={{ ...tableHeaderStyle }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#991B1B')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)')}
                  >
                    Status <SortIndicator field="status" />
                  </th>
                  <th
                    role="columnheader"
                    aria-sort={sortConfig.field === 'species' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={() => handleSort('species')}
                    style={{ ...tableHeaderStyle }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#991B1B')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)')}
                  >
                    Species <SortIndicator field="species" />
                  </th>
                  <th
                    role="columnheader"
                    aria-sort={sortConfig.field === 'abilities' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    style={{ ...tableHeaderStyle, cursor: 'default' }}
                  >
                    Abilities
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((character) => {
                  const statusColors = getStatusColor(character.status);
                  return (
                    <tr
                      key={character.id}
                      role="row"
                      onClick={() => handleRowClick(character)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: '#FFFFFF',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEF2F2';
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = 'inset 4px 0 0 #DC2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <td role="cell" style={{ ...tableCellStyle, fontWeight: '700' }}>
                        {character.name}
                      </td>
                      <td role="cell" style={{ ...tableCellStyle, color: '#DC2626', fontWeight: '900' }}>
                        {character.codeName}
                      </td>
                      <td role="cell" style={{ ...tableCellStyle }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: getRankingColor(character.ranking),
                              boxShadow: `0 0 8px ${getRankingColor(character.ranking)}`,
                            }}
                          />
                          <span style={{ fontWeight: '700' }}>#{character.ranking}</span>
                        </div>
                      </td>
                      <td role="cell" style={{ ...tableCellStyle }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            background: statusColors.bg,
                            color: statusColors.text,
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            border: `2px solid ${statusColors.bg}`,
                            boxShadow: `0 2px 6px ${statusColors.bg}80`,
                          }}
                        >
                          {character.status}
                        </span>
                      </td>
                      <td role="cell" style={{ ...tableCellStyle, fontWeight: '600' }}>
                        {character.species}
                      </td>
                      <td role="cell" style={{ ...tableCellStyle }}>
                        {renderAbilities(character.abilities)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
              borderTop: '4px solid #DC2626',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: '#F59E0B', fontSize: '14px', fontWeight: '700', letterSpacing: '1px' }}>
                SHOWING {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredAndSortedData.length)} OF{' '}
                {filteredAndSortedData.length}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="pageSize" style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '700' }}>
                  PER PAGE:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#111827',
                    border: '2px solid #DC2626',
                    borderRadius: '4px',
                    color: '#F59E0B',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 20px',
                  background: currentPage === 1 ? '#374151' : '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.2s ease',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) e.currentTarget.style.background = '#991B1B';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) e.currentTarget.style.background = '#DC2626';
                }}
              >
                ◀ PREV
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '10px 16px',
                      background: currentPage === pageNum ? '#F59E0B' : '#374151',
                      color: '#FFFFFF',
                      border: currentPage === pageNum ? '2px solid #DC2626' : 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      minWidth: '44px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== pageNum) e.currentTarget.style.background = '#4B5563';
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== pageNum) e.currentTarget.style.background = '#374151';
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '10px 20px',
                  background: currentPage === totalPages ? '#374151' : '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.2s ease',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) e.currentTarget.style.background = '#991B1B';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) e.currentTarget.style.background = '#DC2626';
                }}
              >
                NEXT ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {selectedCharacter && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeDrawer}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease',
            }}
          />

          {/* Drawer */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '600px',
              background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)',
              boxShadow: '-10px 0 40px rgba(220, 38, 38, 0.6)',
              zIndex: 1000,
              overflowY: 'auto',
              animation: 'slideInRight 0.3s ease',
              border: '4px solid #DC2626',
              borderRight: 'none',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                borderBottom: '4px solid #7F1D1D',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2
                    id="drawer-title"
                    style={{
                      fontSize: '36px',
                      fontWeight: '900',
                      color: '#FFFFFF',
                      margin: '0 0 4px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    }}
                  >
                    {selectedCharacter.codeName}
                  </h2>
                  <div style={{ fontSize: '16px', color: '#FEF2F2', fontWeight: '700', letterSpacing: '1px' }}>
                    {selectedCharacter.name}
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  aria-label="Close drawer"
                  style={{
                    background: '#7F1D1D',
                    border: '2px solid #FFFFFF',
                    color: '#FFFFFF',
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    fontSize: '20px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.color = '#DC2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#7F1D1D';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <InfoBlock label="Age" value={`${selectedCharacter.age} years`} />
                <InfoBlock label="Species" value={selectedCharacter.species} />
                <InfoBlock label="Power Ranking" value={`#${selectedCharacter.ranking}`} color={getRankingColor(selectedCharacter.ranking)} />
                <InfoBlock label="Movies" value={`${selectedCharacter.moviesCount} appearances`} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#F59E0B',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                  }}
                >
                  Status
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: getStatusColor(selectedCharacter.status).bg,
                    color: getStatusColor(selectedCharacter.status).text,
                    fontSize: '14px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: `2px solid ${getStatusColor(selectedCharacter.status).bg}`,
                  }}
                >
                  {selectedCharacter.status}
                </span>
              </div>

              <InfoBlock label="Affiliation" value={selectedCharacter.affiliation} />
              <InfoBlock label="Birth Place" value={selectedCharacter.birthPlace} />
              <InfoBlock label="Date of Birth" value={selectedCharacter.dateOfBirth} />
              <InfoBlock label="Current Location" value={selectedCharacter.currentLocation} />
              <InfoBlock label="First Appearance" value={selectedCharacter.firstAppearance} />

              <div style={{ marginTop: '24px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#F59E0B',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                  }}
                >
                  Abilities & Powers
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedCharacter.abilities.map((ability, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                        color: '#FEF2F2',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        border: '2px solid #7F1D1D',
                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                      }}
                    >
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}
          </style>
        </>
      )}
    </div>
  );
}

function InfoBlock({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          fontSize: '12px',
          fontWeight: '800',
          color: '#F59E0B',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: '700',
          color: color || '#FFFFFF',
          letterSpacing: '0.5px',
        }}
      >
        {value}
      </div>
    </div>
  );
}