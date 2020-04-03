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
import { rssUrl } from "../urls";

const SubscribePanel = ({ slug }: { slug: string }) => {
  const host = typeof window !== "undefined" ? window.location.host : "";
  const protocol =
    typeof window !== "undefined" ? window.location.protocol : "";

  const subscribeLinks: { url: string; label: string }[] = [
    {
      label: "Apple Podcast (iPad / iPhone)",
      url: rssUrl("podcast:", host, slug)
    },
    {
      label: "Apple Podcast (Mac)",
      url: rssUrl("pcast:", host, slug)
    },
    { label: "RSS Feed", url: rssUrl("feed:", host, slug) },
    {
      label: "XML",
      url: rssUrl(protocol, host, slug)
    }
  ];

  return (
    <ExpansionPanel>
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
