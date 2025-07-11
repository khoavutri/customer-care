import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Markdown = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={dark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  p({ children }) {
    return <p className="my-2">{children}</p>;
  },

  ul({ children }) {
    return <ul className="list-disc pl-5">{children}</ul>;
  },

  ol({ children }) {
    return <ol className="list-decimal pl-5">{children}</ol>;
  },

  h1({ children }) {
    return <h1 className="text-3xl font-bold my-2">{children}</h1>;
  },

  h2({ children }) {
    return <h2 className="text-2xl font-semibold my-2">{children}</h2>;
  },

  h3({ children }) {
    return <h3 className="text-xl font-medium my-2">{children}</h3>;
  },
};

export default Markdown;
