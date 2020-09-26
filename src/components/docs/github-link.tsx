export const GithubLink = ({ url }: { url: string }) => {
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    return <sub style={{ marginBottom: -14, padding: 12, display: "block", background: "#1e1e1e" }}>
        <a href={url} target="_Blank">{fileName}</a>
    </sub>
}