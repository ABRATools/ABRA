function PageLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="grid grid-cols-[1fr_50fr_1fr] lg:grid-cols-[1fr_7fr_1fr] grid-rows-1 mb-20">
        <div></div>
        <div className="place-content-stretch">
          <div className="grid grid-cols-1">
            {children}
          </div>
        </div>
        <div></div>
      </div>
    );
  }
  
  export default PageLayout;