import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import { useState } from "react";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);
  const [dataError, setDataError] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  async function getTokenBalance() {
    let data;
    const config = {
      apiKey: "sJbNoMVSFZ-aVhVMIYt2vzoT7K0zSsNT",
      network: Network.ETH_MAINNET,
    };
    try {
      setLoading(true);

      const alchemy = new Alchemy(config);

      if (Utils.isHexString(userAddress)) {
        data = await alchemy.core.getTokenBalances(userAddress);
      } else {
        const resolvedEns = await alchemy.core.resolveName(userAddress);

        data = await alchemy.core.getTokenBalances(resolvedEns);
      }

      setResults(data);

      const tokenDataPromises = [];

      for (let i = 0; i < data.tokenBalances.length; i++) {
        const tokenData = alchemy.core.getTokenMetadata(
          data.tokenBalances[i].contractAddress
        );
        tokenDataPromises.push(tokenData);
      }

      setTokenDataObjects(await Promise.all(tokenDataPromises));
      setLoading(false);
      setHasQueried(true);
      setUserAddress("");
    } catch (error) {
      setDataError(true);
      setLoading(false);
    }
  }

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      getTokenBalance();
    }
  };

  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={"center"}
          justifyContent="center"
          flexDirection={"column"}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={"center"}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          value={userAddress}
          onKeyDown={handleKeyDown}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button
          fontSize={20}
          isLoading={loading}
          colorScheme="teal"
          variant="solid"
          loadingText="Loading"
          onClick={getTokenBalance}
          mt={36}
          bgColor={dataError ? "red" : "green"}
          isDisabled={!userAddress}
        >
          {dataError
            ? "There is an error with your request..."
            : "Check ERC-20 Token Balances"}
        </Button>

        <Heading my={36}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <SimpleGrid w={"90vw"} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={"column"}
                  color="white"
                  bg="blue"
                  w={"20vw"}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    )}
                  </Box>
                  <Image src={tokenDataObjects[i].logo} />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          "Please make a query! This may take a few seconds..."
        )}
      </Flex>
    </Box>
  );
}

export default App;
