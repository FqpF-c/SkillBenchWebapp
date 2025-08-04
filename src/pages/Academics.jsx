import React from 'react';
import DepartmentSelector from '../components/academics/DepartmentSelector';
import SubjectAccordion from '../components/academics/SubjectAccordion';

const Academics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
      <div className="md:col-span-1">
        <DepartmentSelector />
      </div>
      <div className="md:col-span-3">
        <SubjectAccordion />
      </div>
    </div>
  );
};

export default Academics;
