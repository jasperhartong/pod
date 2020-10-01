import { CSSProperties } from "@material-ui/styles";

type Variant = "above-code" | "below-header";

export const GithubLink = ({ url, variant }: { url: string, variant: Variant }) => {
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const styles: Record<Variant, CSSProperties> = {
        "above-code": {
            marginBottom: -14, padding: 12, display: "block", background: "#1e1e1e"
        },
        "below-header": {
            padding: 0, paddingBottom: 8, display: "block"
        }
    }
    return <sub style={styles[variant]}>
        <a href={url} target="_Blank">{fileName} →</a>
    </sub>
}