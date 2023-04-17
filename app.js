import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const activeGames = {};

app.post('/interactions', async function (req, res) {
  const { type, id, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Oi ' + getRandomEmoji(),
        },
      });
    }

    if (name === 'challenge' && id) {
      const userId = req.body.member.user.id;
      const objectName = req.body.data.options[0].value;
      activeGames[id] = {
        id: userId,
        objectName,
      };

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Rock papers scissors challenge from <@${userId}>`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: `accept_button_${req.body.id}`,
                  label: 'Accept',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }
  }


  // if (type === InteractionType.MESSAGE_COMPONENT) {
  //   const componentId = data.custom_id;

  //   if (componentId.startsWith('accept_button_')) {
  //     const gameId = componentId.replace('accept_button_', '');
  //     const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
  //     try {
  //       await res.send({
  //         type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  //         data: {
  //           content: 'What is your object of choice?',
  //           flags: InteractionResponseFlags.EPHEMERAL,
  //           components: [
  //             {
  //               type: MessageComponentTypes.ACTION_ROW,
  //               components: [
  //                 {
  //                   type: MessageComponentTypes.STRING_SELECT,
  //                   custom_id: `select_choice_${gameId}`,
  //                   options: getShuffledOptions(),
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       });
  //       await DiscordRequest(endpoint, { method: 'DELETE' });
  //     } catch (err) {
  //       console.error('Error sending message:', err);
  //     }
  //   } else if (componentId.startsWith('select_choice_')) {
  //     const gameId = componentId.replace('select_choice_', '');
  //     if (activeGames[gameId]) {
  //       const userId = req.body.member.user.id;
  //       const objectName = data.values[0];
  //       const resultStr = getResult(activeGames[gameId], {
  //         id: userId,
  //         objectName,
  //       });

  //       delete activeGames[gameId];
  //       const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
  //       try {
  //         await res.send({
  //           type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  //           data: { content: resultStr },
  //         });
  //         await DiscordRequest(endpoint, {
  //           method: 'PATCH',
  //           body: {
  //             content: 'Nice choice ' + getRandomEmoji(),
  //             components: [],
  //           },
  //         });
  //       } catch (err) {
  //         console.error('Error sending message:', err);
  //       }
  //     }
  //   }
  // }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
