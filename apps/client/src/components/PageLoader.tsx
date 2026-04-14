import { Spinner } from "@/components/ui/spinner";

export default function PageLoader() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Spinner size={48} className="text-primary" />
        </div>
    );
}
