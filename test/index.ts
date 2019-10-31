import Tangle from "../lib/tangleConnector";
import DID from "../lib/did";

var SEED =
  "NHYROMJIFOWRHOEECSDWFVBSSNUZOHNPHRVXZCGPTWMUTLQPCLEM9RPJ9SSNCPMYGFVFTQG9DIPLA9EZT";

var tangle = new Tangle();

var did = new DID().fromSeed(SEED);
