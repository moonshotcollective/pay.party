import { TaobaoSquareFilled } from '@ant-design/icons';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { NETWORKS } from "../../constants";
const cachedNetwork = window.localStorage.getItem("network");

let targetNetwork = NETWORKS[cachedNetwork || process.env.REACT_APP_NETWORK_NAME];

function NetworkNotifier() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  let metaMaskChainId;
  const toggleNetworkNotifierModal = (chainId) => {
    metaMaskChainId = parseInt(chainId, 16);
    if (targetNetwork.chainId == chainId) {
      return;
    }
    if (targetNetwork.chainId !== chainId) {
      onOpen();
    }
    // console.log("target Network ChainId: " + targetNetwork.chainId);
    // console.log("Metamask chainId: "+ metaMaskChainId);
    ethereum.removeListener('chainChanged', toggleNetworkNotifierModal);
  }
  ethereum.on('chainChanged', toggleNetworkNotifierModal);
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Wrong Network</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            You have <b>SomeNetwork</b> selected and you need to be on <b>SomeOtherNetwork</b>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='ghost'>Switch Network</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default NetworkNotifier;
