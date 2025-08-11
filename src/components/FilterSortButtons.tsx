"use client";

import { useState } from 'react';
import Image from 'next/image';
import FilterSortModal from './FilterSortModal';
interface FilterSortButtonsProps {
  classes?: { id: number; name: string }[];
  subjects?: { id: number; name: string }[];
}

export default function FilterSortButtons({ classes = [], subjects = [] }: FilterSortButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button 
          onClick={openModal}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-500 transition-colors"
          title="Filter and Sort"
        >
          <Image src="/filter.png" alt="Filter" width={14} height={14} />
        </button>
        <button 
          onClick={openModal}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-500 transition-colors"
          title="Filter and Sort"
        >
          <Image src="/sort.png" alt="Sort" width={14} height={14} />
        </button>
      </div>
      
      <FilterSortModal
        isOpen={isModalOpen}
        onClose={closeModal}
        classes={classes}
        subjects={subjects}
      />
    </>
  );
}
