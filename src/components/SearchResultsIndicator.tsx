"use client";

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface SearchResultsIndicatorProps {
  totalResults: number;
  classes?: { id: number; name: string }[];
  subjects?: { id: number; name: string }[];
}

export default function SearchResultsIndicator({ 
  totalResults, 
  classes = [], 
  subjects = [] 
}: SearchResultsIndicatorProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get('search');
  const classId = searchParams.get('classId');
  const subjectId = searchParams.get('subjectId');
  const gender = searchParams.get('gender');
  const bloodType = searchParams.get('bloodType');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  const hasActiveFilters = search || classId || subjectId || gender || bloodType || (sortBy && sortBy !== 'name') || (sortOrder && sortOrder !== 'asc');

  if (!hasActiveFilters) {
    return (
      <div className="text-sm text-gray-600 mb-4">
        Showing all {totalResults} teachers
      </div>
    );
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Keep only the page parameter if it exists
    const page = searchParams.get('page');
    if (page) {
      params.set('page', page);
    }
    router.push(`?${params.toString()}`);
  };

  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case 'search':
        return `Search: "${value}"`;
      case 'classId':
        const classItem = classes.find(cls => cls.id.toString() === value);
        return `Class: ${classItem?.name || value}`;
      case 'subjectId':
        const subjectItem = subjects.find(subj => subj.id.toString() === value);
        return `Subject: ${subjectItem?.name || value}`;
      case 'gender':
        return `Gender: ${value}`;
      case 'bloodType':
        return `Blood Type: ${value}`;
      case 'sortBy':
        const sortLabels: { [key: string]: string } = {
          'name': 'Name',
          'username': 'Teacher ID',
          'email': 'Email',
          'phone': 'Phone',
          'birthday': 'Birthday',
          'createdAt': 'Date Added'
        };
        return `Sorted by: ${sortLabels[value] || value}`;
      default:
        return `${key}: ${value}`;
    }
  };

  const activeFilters = [
    { key: 'search', value: search },
    { key: 'classId', value: classId },
    { key: 'subjectId', value: subjectId },
    { key: 'gender', value: gender },
    { key: 'bloodType', value: bloodType },
    ...(sortBy && sortBy !== 'name' ? [{ key: 'sortBy', value: sortBy }] : []),
    ...(sortOrder && sortOrder !== 'asc' ? [{ key: 'sortOrder', value: sortOrder }] : [])
  ].filter(filter => filter.value);

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-blue-900">
          Showing {totalResults} result{totalResults !== 1 ? 's' : ''}
        </div>
        <button
          onClick={clearAllFilters}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Clear all filters
        </button>
      </div>
      
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {getFilterLabel(filter.key, filter.value!)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
