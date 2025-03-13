"use client";

export const GridBackground = () => {
  return (
    <>
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-indigo-200/20 rounded-full mix-blend-multiply filter blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </>
  );
};
