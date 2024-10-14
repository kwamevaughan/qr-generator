const Footer = ({ mode }) => {
    const currentYear = new Date().getFullYear();

    return (
        <div className={`flex justify-center items-center h-16 w-full p-4 shadow-lg ${mode === 'dark' ? 'bg-[#1a1a2e] text-white' : 'bg-white text-black'}`}>
            <p className="text-center">
                © {currentYear},
                <span className="mx-1"> </span>
                <a
                    href="https://growthpad.co.ke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-indigo-600">
                    Growthpad Digital Consultancy
                </a>
            </p>
        </div>
    );
};

export default Footer;
