import Link from "next/link"
import Button from "../commons/Button"



const Favorite: React.FC = () => {
  return (
    <div className="bg-[#171D22] text-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-8">Your Favorite Movies</h1>
      <p className="text-lg md:text-2xl mb-12 text-center max-w-2xl">
        You haven&apos;t added any movies to your favorites yet. Browse our collection and add your favorite movies to see them here!
      </p>
      <Button title="Favorite" action={() => {}} />
      <div className="mt-10">
        <Link href="/" className="text-[#3A97D4] hover:text-[#F2AA4C] text-lg transition-colors duration-300">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default Favorite