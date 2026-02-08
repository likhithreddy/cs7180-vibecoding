import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

interface MarvelCharacter {
  id: number;
  name: string;
  codeName: string;
  age: number;
  ranking: number;
  placeOfBirth: string;
  dateOfBirth: string;
  affiliation: string;
}

const marvelCharacters: MarvelCharacter[] = [
  { id: 1, name: 'Peter Parker', codeName: 'Spider-Man', age: 28, ranking: 5, placeOfBirth: 'Queens, New York', dateOfBirth: '1995-08-10', affiliation: 'Avengers' },
  { id: 2, name: 'Tony Stark', codeName: 'Iron Man', age: 53, ranking: 2, placeOfBirth: 'Manhattan, New York', dateOfBirth: '1970-05-29', affiliation: 'Avengers' },
  { id: 3, name: 'Steve Rogers', codeName: 'Captain America', age: 105, ranking: 1, placeOfBirth: 'Brooklyn, New York', dateOfBirth: '1918-07-04', affiliation: 'Avengers' },
  { id: 4, name: 'Natasha Romanoff', codeName: 'Black Widow', age: 39, ranking: 8, placeOfBirth: 'Stalingrad, Russia', dateOfBirth: '1984-11-22', affiliation: 'Avengers' },
  { id: 5, name: 'Bruce Banner', codeName: 'Hulk', age: 49, ranking: 3, placeOfBirth: 'Dayton, Ohio', dateOfBirth: '1974-12-18', affiliation: 'Avengers' },
  { id: 6, name: 'Thor Odinson', codeName: 'Thor', age: 1500, ranking: 4, placeOfBirth: 'Asgard', dateOfBirth: '0518-01-01', affiliation: 'Avengers' },
  { id: 7, name: 'Clint Barton', codeName: 'Hawkeye', age: 52, ranking: 12, placeOfBirth: 'Waverly, Iowa', dateOfBirth: '1971-01-07', affiliation: 'Avengers' },
  { id: 8, name: 'Wanda Maximoff', codeName: 'Scarlet Witch', age: 32, ranking: 6, placeOfBirth: 'Sokovia', dateOfBirth: '1991-02-10', affiliation: 'Avengers' },
  { id: 9, name: 'Stephen Strange', codeName: 'Doctor Strange', age: 45, ranking: 7, placeOfBirth: 'Philadelphia, Pennsylvania', dateOfBirth: '1978-11-18', affiliation: 'Avengers' },
  { id: 10, name: 'T\'Challa', codeName: 'Black Panther', age: 41, ranking: 9, placeOfBirth: 'Wakanda', dateOfBirth: '1982-05-21', affiliation: 'Avengers' },
  { id: 11, name: 'Carol Danvers', codeName: 'Captain Marvel', age: 58, ranking: 10, placeOfBirth: 'Boston, Massachusetts', dateOfBirth: '1965-04-24', affiliation: 'Avengers' },
  { id: 12, name: 'Scott Lang', codeName: 'Ant-Man', age: 54, ranking: 15, placeOfBirth: 'Coral Gables, Florida', dateOfBirth: '1969-04-06', affiliation: 'Avengers' },
  { id: 13, name: 'Hope van Dyne', codeName: 'Wasp', age: 37, ranking: 16, placeOfBirth: 'Los Angeles, California', dateOfBirth: '1986-10-12', affiliation: 'Avengers' },
  { id: 14, name: 'Sam Wilson', codeName: 'Falcon', age: 42, ranking: 13, placeOfBirth: 'Harlem, New York', dateOfBirth: '1981-09-23', affiliation: 'Avengers' },
  { id: 15, name: 'James Rhodes', codeName: 'War Machine', age: 56, ranking: 17, placeOfBirth: 'Philadelphia, Pennsylvania', dateOfBirth: '1967-10-08', affiliation: 'Avengers' },
  { id: 16, name: 'Vision', codeName: 'Vision', age: 8, ranking: 11, placeOfBirth: 'Seoul, South Korea', dateOfBirth: '2015-05-01', affiliation: 'Avengers' },
  { id: 17, name: 'Bucky Barnes', codeName: 'Winter Soldier', age: 106, ranking: 14, placeOfBirth: 'Shelbyville, Indiana', dateOfBirth: '1917-03-10', affiliation: 'Avengers' },
  { id: 18, name: 'Loki Laufeyson', codeName: 'Loki', age: 1054, ranking: 20, placeOfBirth: 'Jotunheim', dateOfBirth: '0965-12-17', affiliation: 'Villain' },
  { id: 19, name: 'Wade Wilson', codeName: 'Deadpool', age: 45, ranking: 18, placeOfBirth: 'Regina, Saskatchewan', dateOfBirth: '1978-11-22', affiliation: 'Independent' },
  { id: 20, name: 'Matt Murdock', codeName: 'Daredevil', age: 44, ranking: 19, placeOfBirth: 'Hell\'s Kitchen, New York', dateOfBirth: '1979-04-16', affiliation: 'Defenders' },
];

type SortField = keyof MarvelCharacter;
type SortDirection = 'asc' | 'desc' | null;

export default function MarvelDataTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...marvelCharacters];

    // Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(character =>
        character.name.toLowerCase().includes(term) ||
        character.codeName.toLowerCase().includes(term) ||
        character.placeOfBirth.toLowerCase().includes(term) ||
        character.affiliation.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return sortDirection === 'asc' ? comparison : -comparison;
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
    }

    return result;
  }, [searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 inline ml-1" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="w-4 h-4 inline ml-1" />;
    }
    return null;
  };

  const getAffiliationColor = (affiliation: string) => {
    switch (affiliation) {
      case 'Avengers': return 'bg-blue-100 text-blue-800';
      case 'Villain': return 'bg-red-100 text-red-800';
      case 'Defenders': return 'bg-green-100 text-green-800';
      case 'Independent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Marvel Characters Database</h1>
          <p className="text-gray-600">Browse and search through the Marvel Universe roster</p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, code name, birthplace, or affiliation..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-600 to-blue-600 text-white">
                <tr>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th 
                    onClick={() => handleSort('codeName')}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Code Name <SortIcon field="codeName" />
                  </th>
                  <th 
                    onClick={() => handleSort('age')}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Age <SortIcon field="age" />
                  </th>
                  <th 
                    onClick={() => handleSort('ranking')}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Ranking <SortIcon field="ranking" />
                  </th>
                  <th 
                    onClick={() => handleSort('placeOfBirth')}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Place of Birth <SortIcon field="placeOfBirth" />
                  </th>
                  <th 
                    onClick={() => handleSort('dateOfBirth')}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Date of Birth <SortIcon field="dateOfBirth" />
                  </th>
                  <th 
                    onClick={() => handleSort('affiliation')}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Affiliation <SortIcon field="affiliation" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((character, index) => (
                  <tr key={character.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {character.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {character.codeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {character.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      #{character.ranking}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {character.placeOfBirth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {character.dateOfBirth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getAffiliationColor(character.affiliation)}`}>
                        {character.affiliation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, filteredAndSortedData.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAndSortedData.length}</span> characters
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-700">
                    Per page:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage === pageNum
                            ? 'bg-red-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}