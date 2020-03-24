import {
  List,
  ListItem,
  ListItemText,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import NewWindowIcon from "@material-ui/icons/OpenInNew";
import { rssUrl } from "../../src/storage/urls";

const SubscribePanel = ({ slug }: { slug: string }) => {
  const subscribeLinks: { url: string; label: string }[] = [
    { label: "Apple Podcast (iPad / iPhone)", url: rssUrl(slug, "podcast") },
    { label: "Apple Podcast (Mac)", url: rssUrl(slug, "pcast") },
    { label: "RSS Feed", url: rssUrl(slug, "feed") },
    { label: "XML", url: rssUrl(slug) }
  ];

  return (
    <ExpansionPanel
      style={{ maxWidth: 480 }}
      onChange={(_, isExpanded) => {
        if (isExpanded) {
          window.setTimeout(() => {
            window.scrollBy({ top: 1000 });
          }, 300);
        }
      }}
    >
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="subscribe-content"
        id="subscribe-header"
      >
        <Typography>
          Abboneer in je Podcast App en blijf altijd up-to-date.
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails id="subscribe-content">
        <List dense>
          {subscribeLinks.map(link => (
            <ListItem
              component="a"
              key={`${link.url}${link.label}`}
              button
              href={link.url}
            >
              <NewWindowIcon
                fontSize="small"
                color="secondary"
                style={{ marginRight: 8 }}
              />{" "}
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default SubscribePanel;
